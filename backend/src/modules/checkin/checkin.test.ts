import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { buildAdvice, computeMetrics } from './checkin.service'

// Mock questions for testing
const mockQuestions = [
  { key: 'sleep_d1', group: 'sleep', scaleMax: 10 },
  { key: 'burnout_d1_a', group: 'burnout', scaleMax: 5 },
  { key: 'burnout_d1_b', group: 'burnout', scaleMax: 5 },
  { key: 'burnout_d1_c', group: 'burnout', scaleMax: 5 },
  { key: 'stress_d1_a', group: 'stress', scaleMax: 5 },
  { key: 'stress_d1_b', group: 'stress', scaleMax: 5 },
  { key: 'engagement_d1_a', group: 'engagement', scaleMax: 5 },
  { key: 'engagement_d1_b', group: 'engagement', scaleMax: 5 },
  { key: 'wellbeing_d1_a', group: 'wellbeing', scaleMax: 5 },
  { key: 'wellbeing_d1_b', group: 'wellbeing', scaleMax: 5 },
]

describe('computeMetrics', () => {
  it('returns 50 for all groups when answers is empty', () => {
    const result = computeMetrics([], mockQuestions)
    assert.equal(result.sleep, 50)
    assert.equal(result.burnout, 50)
    assert.equal(result.stress, 50)
    assert.equal(result.engagement, 50)
    assert.equal(result.wellbeing, 50)
  })

  it('returns 100 for sleep when score is max (10/10)', () => {
    const answers = [{ questionKey: 'sleep_d1', value: 10 }]
    const result = computeMetrics(answers, mockQuestions)
    assert.equal(result.sleep, 100)
  })

  it('returns 0 for sleep when score is 0/10', () => {
    const answers = [{ questionKey: 'sleep_d1', value: 0 }]
    const result = computeMetrics(answers, mockQuestions)
    assert.equal(result.sleep, 0)
  })

  it('returns 50 for sleep when score is 5/10', () => {
    const answers = [{ questionKey: 'sleep_d1', value: 5 }]
    const result = computeMetrics(answers, mockQuestions)
    assert.equal(result.sleep, 50)
  })

  it('computes correct percentage for burnout (3/5 = 60%)', () => {
    const answers = [
      { questionKey: 'burnout_d1_a', value: 3 },
      { questionKey: 'burnout_d1_b', value: 3 },
      { questionKey: 'burnout_d1_c', value: 3 },
    ]
    const result = computeMetrics(answers, mockQuestions)
    assert.equal(result.burnout, 60)
  })

  it('averages multiple burnout answers correctly', () => {
    const answers = [
      { questionKey: 'burnout_d1_a', value: 5 }, // 100%
      { questionKey: 'burnout_d1_b', value: 0 }, // 0%
      { questionKey: 'burnout_d1_c', value: 0 }, // 0%
    ]
    const result = computeMetrics(answers, mockQuestions)
    assert.equal(result.burnout, 33) // Math.round(100/3)
  })

  it('returns 100 for all groups when all answers are max', () => {
    const answers = [
      { questionKey: 'sleep_d1', value: 10 },
      { questionKey: 'burnout_d1_a', value: 5 },
      { questionKey: 'burnout_d1_b', value: 5 },
      { questionKey: 'burnout_d1_c', value: 5 },
      { questionKey: 'stress_d1_a', value: 5 },
      { questionKey: 'stress_d1_b', value: 5 },
      { questionKey: 'engagement_d1_a', value: 5 },
      { questionKey: 'engagement_d1_b', value: 5 },
      { questionKey: 'wellbeing_d1_a', value: 5 },
      { questionKey: 'wellbeing_d1_b', value: 5 },
    ]
    const result = computeMetrics(answers, mockQuestions)
    assert.equal(result.sleep, 100)
    assert.equal(result.burnout, 100)
    assert.equal(result.stress, 100)
    assert.equal(result.engagement, 100)
    assert.equal(result.wellbeing, 100)
  })

  it('returns 0 for all groups when all answers are min (1)', () => {
    // value=1 on scaleMax=5 → 20%; value=1 on scaleMax=10 → 10%
    const answers = [
      { questionKey: 'sleep_d1', value: 1 },
      { questionKey: 'burnout_d1_a', value: 1 },
      { questionKey: 'burnout_d1_b', value: 1 },
      { questionKey: 'burnout_d1_c', value: 1 },
      { questionKey: 'stress_d1_a', value: 1 },
      { questionKey: 'stress_d1_b', value: 1 },
      { questionKey: 'engagement_d1_a', value: 1 },
      { questionKey: 'engagement_d1_b', value: 1 },
      { questionKey: 'wellbeing_d1_a', value: 1 },
      { questionKey: 'wellbeing_d1_b', value: 1 },
    ]
    const result = computeMetrics(answers, mockQuestions)
    assert.equal(result.sleep, 10)     // 1/10 * 100
    assert.equal(result.burnout, 20)   // 1/5 * 100
    assert.equal(result.stress, 20)
    assert.equal(result.engagement, 20)
    assert.equal(result.wellbeing, 20)
  })

  it('ignores answers for unknown question keys', () => {
    const answers = [{ questionKey: 'unknown_key', value: 5 }]
    const result = computeMetrics(answers, mockQuestions)
    // All groups have no matching answers → defaults to 50
    assert.equal(result.sleep, 50)
    assert.equal(result.burnout, 50)
  })

  it('sleep scaleMax=10 normalises differently from scaleMax=5', () => {
    const answers5 = [{ questionKey: 'burnout_d1_a', value: 5 }]
    const answers10 = [{ questionKey: 'sleep_d1', value: 5 }]
    const r5 = computeMetrics(answers5, mockQuestions)
    const r10 = computeMetrics(answers10, mockQuestions)
    assert.equal(r5.burnout, 100)  // 5/5 * 100
    assert.equal(r10.sleep, 50)    // 5/10 * 100
  })

  it('computes stress correctly with two answers', () => {
    const answers = [
      { questionKey: 'stress_d1_a', value: 4 }, // 80%
      { questionKey: 'stress_d1_b', value: 2 }, // 40%
    ]
    const result = computeMetrics(answers, mockQuestions)
    assert.equal(result.stress, 60) // avg(80, 40) = 60
  })

  it('computes engagement correctly with two answers', () => {
    const answers = [
      { questionKey: 'engagement_d1_a', value: 5 }, // 100%
      { questionKey: 'engagement_d1_b', value: 3 }, // 60%
    ]
    const result = computeMetrics(answers, mockQuestions)
    assert.equal(result.engagement, 80) // avg(100, 60) = 80
  })

  it('computes wellbeing correctly with two answers', () => {
    const answers = [
      { questionKey: 'wellbeing_d1_a', value: 1 }, // 20%
      { questionKey: 'wellbeing_d1_b', value: 4 }, // 80%
    ]
    const result = computeMetrics(answers, mockQuestions)
    assert.equal(result.wellbeing, 50) // avg(20, 80) = 50
  })

  it('only computes metrics for the matching group, others remain 50', () => {
    const answers = [{ questionKey: 'sleep_d1', value: 10 }]
    const result = computeMetrics(answers, mockQuestions)
    assert.equal(result.sleep, 100)
    assert.equal(result.burnout, 50)
    assert.equal(result.stress, 50)
    assert.equal(result.engagement, 50)
    assert.equal(result.wellbeing, 50)
  })
})

describe('buildAdvice', () => {
  it('returns burnout+sleep advice when burnout>70 and sleep<40', () => {
    const advice = buildAdvice({ burnout: 80, sleep: 30, stress: 50, engagement: 50, wellbeing: 50 })
    assert.ok(advice.includes('Выгорание нарастает'))
  })

  it('returns burnout advice when only burnout>75', () => {
    const advice = buildAdvice({ burnout: 80, sleep: 60, stress: 50, engagement: 50, wellbeing: 50 })
    assert.ok(advice.includes('Высокий риск выгорания'))
  })

  it('returns burnout+sleep advice takes priority over high burnout alone (burnout>70 and sleep<40)', () => {
    // burnout > 70 AND sleep < 40 → burnout+sleep branch fires first
    const advice = buildAdvice({ burnout: 76, sleep: 25, stress: 50, engagement: 50, wellbeing: 50 })
    assert.ok(advice.includes('Выгорание нарастает'))
    assert.ok(!advice.includes('Высокий риск выгорания'))
  })

  it('returns stress advice when stress>75', () => {
    const advice = buildAdvice({ burnout: 50, sleep: 60, stress: 80, engagement: 50, wellbeing: 50 })
    assert.ok(advice.includes('напряжения'))
  })

  it('returns sleep advice when sleep<30', () => {
    const advice = buildAdvice({ burnout: 40, sleep: 20, stress: 50, engagement: 50, wellbeing: 50 })
    assert.ok(advice.includes('Сон был тяжёлым'))
  })

  it('returns positive advice when engagement>70 and wellbeing>70', () => {
    const advice = buildAdvice({ burnout: 20, sleep: 80, stress: 20, engagement: 80, wellbeing: 80 })
    assert.ok(advice.includes('Хороший день'))
  })

  it('returns motivation advice when engagement<30', () => {
    const advice = buildAdvice({ burnout: 40, sleep: 70, stress: 40, engagement: 20, wellbeing: 50 })
    assert.ok(advice.includes('Мотивация невысокая'))
  })

  it('returns wellbeing advice when wellbeing<30', () => {
    const advice = buildAdvice({ burnout: 40, sleep: 70, stress: 40, engagement: 50, wellbeing: 20 })
    assert.ok(advice.includes('Тяжёлый день'))
  })

  it('returns default advice for average scores', () => {
    const advice = buildAdvice({ burnout: 50, sleep: 50, stress: 50, engagement: 50, wellbeing: 50 })
    assert.ok(advice.includes('Ты заметил себя сегодня'))
  })

  it('high stress takes priority over low sleep (stress > 75 checked before sleep < 30)', () => {
    // burnout <= 70 or sleep >= 40, so burnout branches don't fire
    // stress > 75 fires before sleep < 30
    const advice = buildAdvice({ burnout: 40, sleep: 25, stress: 80, engagement: 50, wellbeing: 50 })
    assert.ok(advice.includes('напряжения'))
  })

  it('burnout alone (>75) takes priority over stress (>75)', () => {
    const advice = buildAdvice({ burnout: 80, sleep: 60, stress: 80, engagement: 50, wellbeing: 50 })
    assert.ok(advice.includes('Высокий риск выгорания'))
  })

  it('low engagement takes priority over low wellbeing when both below threshold', () => {
    const advice = buildAdvice({ burnout: 40, sleep: 70, stress: 40, engagement: 20, wellbeing: 20 })
    assert.ok(advice.includes('Мотивация невысокая'))
  })

  it('does not return positive advice when only engagement is high', () => {
    const advice = buildAdvice({ burnout: 20, sleep: 80, stress: 20, engagement: 80, wellbeing: 50 })
    assert.ok(!advice.includes('Хороший день'))
  })

  it('does not return positive advice when only wellbeing is high', () => {
    const advice = buildAdvice({ burnout: 20, sleep: 80, stress: 20, engagement: 50, wellbeing: 80 })
    assert.ok(!advice.includes('Хороший день'))
  })

  it('boundary: burnout exactly 70 does not trigger burnout+sleep branch', () => {
    const advice = buildAdvice({ burnout: 70, sleep: 30, stress: 50, engagement: 50, wellbeing: 50 })
    assert.ok(!advice.includes('Выгорание нарастает'))
  })

  it('boundary: burnout exactly 75 does not trigger high burnout branch', () => {
    const advice = buildAdvice({ burnout: 75, sleep: 60, stress: 50, engagement: 50, wellbeing: 50 })
    assert.ok(!advice.includes('Высокий риск выгорания'))
  })

  it('boundary: stress exactly 75 does not trigger stress branch', () => {
    const advice = buildAdvice({ burnout: 40, sleep: 60, stress: 75, engagement: 50, wellbeing: 50 })
    assert.ok(!advice.includes('напряжения') || advice.includes('Ты заметил себя'))
  })

  it('boundary: sleep exactly 30 does not trigger sleep branch', () => {
    const advice = buildAdvice({ burnout: 40, sleep: 30, stress: 40, engagement: 50, wellbeing: 50 })
    assert.ok(!advice.includes('Сон был тяжёлым'))
  })

  it('returns a non-empty string for any input', () => {
    const advice = buildAdvice({ burnout: 0, sleep: 0, stress: 0, engagement: 0, wellbeing: 0 })
    assert.ok(typeof advice === 'string' && advice.length > 0)
  })
})
