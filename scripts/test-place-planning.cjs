/* global __dirname */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const { test } = require('node:test');

function loadTs(relativePath, fetchMock) {
  const source = fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const result = { exports: {} };
  new Function('module', 'exports', 'fetch', code)(result, result.exports, fetchMock);
  return result.exports;
}
const schedule = loadTs('src/lib/placeSchedule.ts');

test('시작·종료일을 포함하고 날짜 미정은 1일로 계산한다', () => {
  assert.equal(schedule.getPlanningDays({ start: '2026-09-30', end: '2026-10-02' }, false), 3);
  assert.equal(schedule.getPlanningDays({ start: '2026-09-30', end: '2026-10-02' }, true), 1);
  assert.equal(schedule.getPlanningDays({ start: null, end: null }, false), 1);
});
test('새 선택을 추가하거나 제거해도 기존 날짜와 순서를 유지한다', () => {
  assert.deepEqual(schedule.reconcilePlaceDays(['b', 'a', 'c', 'd'], 2, [['a', 'b'], ['c']]), [
    ['a', 'b'],
    ['c', 'd'],
  ]);
  assert.deepEqual(schedule.reconcilePlaceDays(['b', 'c'], 2, [['a', 'b'], ['c']]), [['b'], ['c']]);
});
test('순서 변경과 빈 날짜로 이동해도 장소가 중복·유실되지 않는다', () => {
  const original = [['a', 'b', 'c'], []];
  assert.deepEqual(schedule.moveScheduledPlace(original, 'a', 0, 3), [['b', 'c', 'a'], []]);
  assert.deepEqual(schedule.moveScheduledPlace(original, 'c', 0, 0), [['c', 'a', 'b'], []]);
  assert.deepEqual(schedule.moveScheduledPlace(original, 'b', 1, 0), [['a', 'c'], ['b']]);
  assert.deepEqual(original, [['a', 'b', 'c'], []]);
  let days = [['a', 'b'], ['c', 'd'], []];
  for (let i = 0; i < 100; i++) {
    days = schedule.moveScheduledPlace(days, ['a', 'b', 'c', 'd'][i % 4], i % 3, i % 5);
    assert.deepEqual(days.flat().sort(), ['a', 'b', 'c', 'd']);
  }
});
test('5곳이 찬 날짜로 이동하면 원래 배치를 보존한다', () => {
  const days = [['a'], ['b', 'c', 'd', 'e', 'f']];
  assert.equal(schedule.moveScheduledPlace(days, 'a', 1, 2), days);
});
test('여행 일수가 줄어도 장소가 사라지지 않는다', () => {
  const next = schedule.reconcilePlaceDays(['a', 'b', 'c'], 1, [['a'], ['b'], ['c']]);
  assert.deepEqual(next, [['a', 'b', 'c']]);
});
test('일정 요청은 빈 날짜를 건너뛰고 사용자가 정한 순서와 날짜를 유지한다', async () => {
  const requests = [];
  const api = loadTs('src/api/itinerary.ts', async (_, options) => {
    const request = JSON.parse(options.body);
    requests.push(request);
    return {
      ok: true,
      json: async () => ({
        transport: request.transport,
        days: [{ day: 1, items: request.placeIds.map((id) => ({ place: { contentId: id } })) }],
      }),
    };
  });
  const result = await api.createScheduledItinerary([['b', 'a'], [], ['c']], '대중교통');
  assert.deepEqual(
    requests.map((r) => r.placeIds),
    [['b', 'a'], ['c']],
  );
  assert.ok(
    requests.every((r) => r.days === 1 && r.optimizeOrder === false && r.transport === '대중교통'),
  );
  assert.deepEqual(
    result.days.map((d) => [d.day, d.items.map((i) => i.place.contentId)]),
    [
      [1, ['b', 'a']],
      [2, []],
      [3, ['c']],
    ],
  );
  await assert.rejects(api.createScheduledItinerary([[]], '자동차'), /선택한 장소/);
  await assert.rejects(
    api.createScheduledItinerary([['1', '2', '3', '4', '5', '6']], '자동차'),
    /최대 5곳/,
  );
  assert.equal(requests.length, 2);
});
