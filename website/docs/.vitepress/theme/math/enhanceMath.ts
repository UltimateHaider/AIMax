export type MathRenderer = (latex: string, display: boolean) => string | null

export type MathMatch = {
  start: number
  end: number
  raw: string
}

const FUNCTION_MAP: Record<string, string> = {
  sqrt: 'sqrt',
  sum: 'sum',
  log: 'log',
  ln: 'ln',
  exp: 'exp',
  sin: 'sin',
  cos: 'cos',
  tan: 'tan',
  softmax: 'operatorname{softmax}',
  sigmoid: 'operatorname{sigmoid}',
  Attention: 'operatorname{Attention}',
  max: 'max',
  min: 'min'
}

const FUNCTION_NAMES = Object.keys(FUNCTION_MAP).sort((a, b) => b.length - a.length)

const GREEK_WORDS: Record<string, string> = {
  alpha: 'alpha',
  beta: 'beta',
  gamma: 'gamma',
  delta: 'delta',
  epsilon: 'epsilon',
  zeta: 'zeta',
  eta: 'eta',
  theta: 'theta',
  iota: 'iota',
  kappa: 'kappa',
  lambda: 'lambda',
  mu: 'mu',
  nu: 'nu',
  xi: 'xi',
  pi: 'pi',
  rho: 'rho',
  sigma: 'sigma',
  tau: 'tau',
  upsilon: 'upsilon',
  phi: 'phi',
  chi: 'chi',
  psi: 'psi',
  omega: 'omega',
  Alpha: 'Alpha',
  Beta: 'Beta',
  Gamma: 'Gamma',
  Delta: 'Delta',
  Theta: 'Theta',
  Lambda: 'Lambda',
  Mu: 'Mu',
  Pi: 'Pi',
  Sigma: 'Sigma',
  Phi: 'Phi',
  Psi: 'Psi',
  Omega: 'Omega'
}

const GREEK_CHARS: Record<string, string> = {
  α: '\\alpha ',
  β: '\\beta ',
  γ: '\\gamma ',
  δ: '\\delta ',
  ε: '\\epsilon ',
  ζ: '\\zeta ',
  η: '\\eta ',
  θ: '\\theta ',
  ι: '\\iota ',
  κ: '\\kappa ',
  λ: '\\lambda ',
  μ: '\\mu ',
  ν: '\\nu ',
  ξ: '\\xi ',
  π: '\\pi ',
  ρ: '\\rho ',
  σ: '\\sigma ',
  τ: '\\tau ',
  υ: '\\upsilon ',
  φ: '\\phi ',
  χ: '\\chi ',
  ψ: '\\psi ',
  ω: '\\omega ',
  Γ: '\\Gamma ',
  Δ: '\\Delta ',
  Θ: '\\Theta ',
  Λ: '\\Lambda ',
  Π: '\\Pi ',
  Σ: '\\Sigma ',
  Φ: '\\Phi ',
  Ψ: '\\Psi ',
  Ω: '\\Omega '
}

const STOP_WORDS = new Set([
  'with',
  'where',
  'when',
  'if',
  'because',
  'and',
  'or',
  'but',
  'so',
  'then',
  'which',
  'that',
  'is',
  'are',
  'was',
  'were',
  'can',
  'will',
  'would',
  'should',
  'could',
  'has',
  'have',
  'had',
  'does',
  'do',
  'did',
  'it',
  'this',
  'these',
  'those',
  'always',
  'only',
  'also',
  'from',
  'for',
  'of',
  'to',
  'in',
  'on',
  'at',
  'by',
  'as',
  'using',
  'into',
  'onto',
  'about',
  'over',
  'under',
  'between',
  'through',
  'than',
  'use',
  'used',
  'see',
  'get',
  'gives',
  'means',
  'represents',
  'equals',
  'bits',
  'nats',
  'bytes',
  'seconds',
  'minutes',
  'hours',
  'params',
  'tokens',
  'layers',
  'samples',
  'examples',
  'units'
])

const PROSE_WORDS = new Set([
  'the',
  'this',
  'that',
  'these',
  'those',
  'is',
  'are',
  'was',
  'were',
  'of',
  'in',
  'to',
  'for',
  'with',
  'from',
  'and',
  'or',
  'if',
  'when',
  'where',
  'which',
  'we',
  'you',
  'it',
  'its',
  'can',
  'will',
  'would',
  'should',
  'could',
  'have',
  'has',
  'had',
  'do',
  'does',
  'did',
  'not',
  'only',
  'also',
  'then',
  'than',
  'into',
  'onto',
  'about',
  'over',
  'under',
  'between',
  'through',
  'using',
  'use',
  'used',
  'see',
  'get',
  'gives',
  'means',
  'represents',
  'equals',
  'while',
  'because',
  'so',
  'every',
  'each',
  'much',
  'many',
  'more',
  'less',
  'same',
  'different',
  'always',
  'never'
])

const CODE_KEYWORDS =
  /\b(?:def|function|import|class|return|print|const|let|var|public|private|async|await|for|while|if|else|elif|switch|case|try|catch|throw|new|delete|typeof|instanceof|SELECT|INSERT|UPDATE|DELETE|FROM|WHERE)\b/

function findClosingParen(source: string, open: number): number {
  let depth = 0
  for (let i = open; i < source.length; i++) {
    if (source[i] === '(') depth += 1
    else if (source[i] === ')') {
      depth -= 1
      if (depth === 0) return i
    }
  }
  return -1
}

function convertFunctions(source: string): string {
  let output = ''
  let index = 0

  while (index < source.length) {
    const rest = source.slice(index)

    const proj = /^proj_([A-Za-z0-9]+)\s*\(/.exec(rest)
    if (proj) {
      const open = index + proj[0].length - 1
      const close = findClosingParen(source, open)
      if (close !== -1) {
        const inner = convertFunctions(source.slice(open + 1, close))
        output += `\\operatorname{proj}_{${proj[1]}}\\left(${inner}\\right)`
        index = close + 1
        continue
      }
    }

    const name = FUNCTION_NAMES.find(
      (candidate) =>
        rest.startsWith(candidate) &&
        !/[A-Za-z0-9_]/.test(source[index - 1] ?? '') &&
        !/[A-Za-z0-9_]/.test(source[index + candidate.length] ?? '')
    )

    if (name) {
      let open = index + name.length
      while (source[open] === ' ') open += 1
      if (source[open] === '(') {
        const close = findClosingParen(source, open)
        if (close !== -1) {
          const inner = convertFunctions(source.slice(open + 1, close))
          if (name === 'sqrt') {
            output += `\\sqrt{${inner}}`
          } else {
            output += `\\${FUNCTION_MAP[name]}\\left(${inner}\\right)`
          }
          index = close + 1
          continue
        }
      }
    }

    output += source[index]
    index += 1
  }

  return output
}

function findRightSideEnd(source: string, start: number): number {
  let index = start
  let depth = 0

  while (index < source.length && index - start < 130) {
    const char = source[index]

    if (char === '(' || char === '[') {
      depth += 1
    } else if (char === ')' || char === ']') {
      if (depth === 0) break
      depth -= 1
    }

    if (depth === 0) {
      if (char === ';' || char === ',' || char === ':') break
      if (char === '.' && (index + 1 >= source.length || /\s/.test(source[index + 1]))) break
      if (char === '\n') break
      if (char === '-' && source[index + 1] === '-') break
      if (char === ' ' && source[index + 1] === '-' && source[index + 2] === ' ') {
        const nextWord = /^([A-Za-z]{3,})\b/.exec(source.slice(index + 3))
        if (nextWord) break
      }
      if (char === ' ' && index + 1 < source.length && source[index + 1] === '(') {
        const previous = source.slice(0, index).trimEnd().slice(-1)
        if (!/[+\-*/=^(]/.test(previous)) break
      }

      if (/\s/.test(char)) {
        const nextWord = /^([A-Za-z]{2,})\b/.exec(source.slice(index + 1))
        if (nextWord && STOP_WORDS.has(nextWord[1].toLowerCase())) break
      }
    }

    index += 1
  }

  return index
}

function isSimpleNumber(value: string): boolean {
  return /^[-+]?\d+(?:\.\d+)?$/.test(value.trim())
}

function hasMathStructure(value: string): boolean {
  return /[(_]/.test(value) || /[A-Za-z]_[A-Za-z0-9]/.test(value)
}

function hasCodeKeywords(value: string): boolean {
  return CODE_KEYWORDS.test(value)
}

function hasFunction(value: string): boolean {
  return /\b(?:sqrt|sum|log|ln|exp|sin|cos|tan|softmax|sigmoid|Attention|max|min|proj_[A-Za-z0-9]+)\s*\(/.test(
    value
  )
}

function unknownMathWords(value: string): string[] {
  const allowed = new Set([
    ...FUNCTION_NAMES,
    ...Object.keys(GREEK_WORDS),
    'proj',
    'dot',
    'infty',
    'inf',
    'lim',
    'integral'
  ])
  const unknown = new Set<string>()
  const wordRe = /[A-Za-z]{3,}/g
  let match: RegExpExecArray | null

  while ((match = wordRe.exec(value))) {
    const word = match[0]
    if (allowed.has(word.toLowerCase())) continue
    if (word.includes('_')) continue

    const before = value.slice(0, match.index).trimEnd().slice(-1)
    const after = value.slice(match.index + word.length).trimStart()[0] ?? ''
    const adjacentToMath = /[=+\-*/^([{|,:]/.test(before) || /[=+\-*/^)]}|,:]/.test(after)
    if (adjacentToMath) continue

    unknown.add(word)
  }

  return [...unknown]
}

function isValidMath(raw: string): boolean {
  const value = raw.trim()
  if (value.length < 3 || value.length > 170) return false
  if (hasCodeKeywords(value)) return false
  if (/[{}]/.test(value)) return false

  if (unknownMathWords(value).length > 0) return false

  const hasEquals = /[=≈≤≥]|!=|->/.test(value)
  const hasOperator = /[+\-*/^]|\\frac|\\sqrt|\\sum/.test(value)
  const hasPower = /\^[A-Za-z0-9({]/.test(value)
  const hasDigit = /\d/.test(value)

  return (
    hasFunction(value) ||
    (hasEquals && (hasOperator || hasDigital(value))) ||
    ((hasOperator || hasPower) && (hasDigit || /[A-Za-z]_/.test(value))) ||
    hasPower
  )
}

function hasDigital(value: string): boolean {
  return /\d/.test(value)
}

function mergeMatches(matches: MathMatch[]): MathMatch[] {
  const sorted = [...matches].sort((a, b) => a.start - b.start || b.end - a.end)
  const merged: MathMatch[] = []

  for (const match of sorted) {
    const previous = merged[merged.length - 1]
    if (!previous) {
      merged.push(match)
      continue
    }
    if (match.start < previous.end) {
      if (match.end > previous.end) previous.end = match.end
      continue
    }
    merged.push(match)
  }

  return merged
}

export function findMathMatches(text: string): MathMatch[] {
  const matches: MathMatch[] = []

  const add = (start: number, end: number): void => {
    if (start < 0 || end <= start) return
    const raw = text.slice(start, end).trim()
    if (!raw || !isValidMath(raw)) return
    matches.push({ start, end, raw })
  }

  // Function expressions: sqrt(...), softmax(...), proj_b(...), ...
  const functionRe =
    /\b(?:sqrt|sum|log|ln|exp|sin|cos|tan|softmax|sigmoid|Attention|max|min|proj_[A-Za-z0-9]+)\s*\(/g
  let functionMatch: RegExpExecArray | null

  while ((functionMatch = functionRe.exec(text))) {
    const nameStart = functionMatch.index
    const open = text.indexOf('(', nameStart + functionMatch[0].length - 1)
    if (open === -1) continue
    const close = findClosingParen(text, open)
    if (close === -1) continue

    let end = close + 1
    const tail = text.slice(end)
    const comparator = tail.match(/^\s*(?:=|≈|≤|≥|!=|~|->)\s*/)
    if (comparator) {
      const rhsStart = end + comparator[0].length
      const rhsEnd = findRightSideEnd(text, rhsStart)
      if (rhsEnd > rhsStart) end = rhsEnd
    } else {
      const postfix = tail.match(/^\s*(?:@|\*|\/|\+|-)\s*/)
      if (postfix) {
        const rhsStart = end + postfix[0].length
        const rhsEnd = findRightSideEnd(text, rhsStart)
        if (rhsEnd > rhsStart) end = rhsEnd
      }
    }

    add(nameStart, end)
    functionRe.lastIndex = end
  }

  // Equality / comparison expressions: f(x) = x^2, H(X,Y) = ..., a = [3,4]
  const equalityRe =
    /(?<![\w.])([A-Za-z][A-Za-z0-9_']*(?:\s*\([^()\n]{0,80}\))?|\[[0-9,\s.-]+\])\s*(?:=|≈|≤|≥|!=|->|~)\s*/g
  let equalityMatch: RegExpExecArray | null

  while ((equalityMatch = equalityRe.exec(text))) {
    const left = equalityMatch[1]
    const rhsStart = equalityRe.lastIndex
    const rhsEnd = findRightSideEnd(text, rhsStart)
    if (rhsEnd <= rhsStart) continue

    const right = text.slice(rhsStart, rhsEnd).trim()
    if (!right) continue
    if (isSimpleNumber(right) && !hasMathStructure(left)) continue

    add(equalityMatch.index, rhsEnd)
  }

  // Arithmetic products: 2*v1 + v2, 2*precision*recall/(precision+recall)
  const productRe =
    /(?<![\w.])(\d+(?:\.\d+)?\s*\*\s*(?:[A-Za-z][A-Za-z0-9_]*|\([^()]*\))(?:\s*(?:\*|\/|\+|-)\s*(?:[A-Za-z][A-Za-z0-9_]*|\([^()]*\)|\d+(?:\.\d+)?))*)/g
  let productMatch: RegExpExecArray | null
  while ((productMatch = productRe.exec(text))) {
    const end = productMatch.index + productMatch[0].length
    if (text.slice(end, end + 12).includes('=')) continue
    add(productMatch.index, end)
  }

  // Power expressions: x^2, QK^T, R^n
  const powerRe =
    /(?<![\w.])([A-Za-z][A-Za-z0-9_]*\s*\^\s*(?:\([^()\n]+\)|[A-Za-z0-9]+(?:\s*[+\-]\s*[A-Za-z0-9_]+)*))/g
  let powerMatch: RegExpExecArray | null
  while ((powerMatch = powerRe.exec(text))) {
    add(powerMatch.index, powerMatch.index + powerMatch[0].length)
  }

  return mergeMatches(matches)
}

export function formulaToLatex(raw: string): string | null {
  let value = raw.trim().replace(/\s+/g, ' ')
  if (!value || value.length > 200 || hasCodeKeywords(value)) return null

  value = value
    .replace(/->/g, '\\to ')
    .replace(/!=/g, '\\neq ')
    .replace(/>=/g, '\\ge ')
    .replace(/<=/g, '\\le ')
    .replace(/\|\|/g, '\\parallel ')
    .replace(/~/g, '\\sim ')
    .replace(/@/g, '\\cdot ')
    .replace(/·/g, '\\cdot ')
    .replace(/×/g, '\\times ')
    .replace(/≈/g, '\\approx ')
    .replace(/≤/g, '\\le ')
    .replace(/≥/g, '\\ge ')
    .replace(/≠/g, '\\neq ')
    .replace(/→/g, '\\to ')
    .replace(/←/g, '\\leftarrow ')
    .replace(/∞/g, '\\infty ')
    .replace(/∂/g, '\\partial ')
    .replace(/∫/g, '\\int ')
    .replace(/∑/g, '\\sum ')
    .replace(/−/g, '-')

  for (const [char, latex] of Object.entries(GREEK_CHARS)) {
    value = value.split(char).join(latex)
  }

  value = value.replace(
    /\b(alpha|beta|gamma|delta|epsilon|zeta|eta|theta|iota|kappa|lambda|mu|nu|xi|pi|rho|sigma|tau|upsilon|phi|chi|psi|omega|Alpha|Beta|Gamma|Delta|Theta|Lambda|Mu|Pi|Sigma|Phi|Psi|Omega)\b/g,
    (word) => `\\${GREEK_WORDS[word] ?? GREEK_WORDS[word.toLowerCase()] ?? word} `
  )

  value = value.replace(/\bR\^\{?([A-Za-z0-9]+)\}?/g, '\\mathbb{R}^{$1}')
  value = convertFunctions(value)
  value = value
    .replace(/\bintegral of\b/gi, '\\int ')
    .replace(/(?<![\\A-Za-z])integral\b/gi, '\\int ')
    .replace(/(?<![\\A-Za-z])sum\b/gi, '\\sum ')
    .replace(/(?<![\\A-Za-z])lim\b/gi, '\\lim ')

  value = value.replace(/\^\(([^()]*)\)/g, '^{$1}')
  value = value.replace(/\^-([A-Za-z0-9]+)/g, '^{-$1}')
  value = value.replace(
    /\(?([A-Za-z0-9_]+(?:\s+dot\s+[A-Za-z0-9_]+)+)\s*\/\s*([A-Za-z0-9_]+(?:\s+dot\s+[A-Za-z0-9_]+)+)\)?/gi,
    '\\frac{$1}{$2}'
  )
  value = value.replace(/\s+dot\s+/gi, ' \\cdot ')
  value = value.replace(
    /\(([^()\\]*)\)\s*\/\s*\(([^()\\]*)\)/g,
    '\\frac{$1}{$2}'
  )
  value = value.replace(
    /(?<![\\A-Za-z0-9])([A-Za-z][A-Za-z0-9_]*)\s*\/\s*([A-Za-z][A-Za-z0-9_]*)(?![A-Za-z0-9])/g,
    '\\frac{$1}{$2}'
  )

  value = value.replace(
    /(?<![\w\\])([A-Za-z][A-Za-z0-9]*)_([A-Za-z0-9]+)/g,
    '$1_{$2}'
  )
  value = value.replace(/(?<![\w\\])([A-Za-z])(\d+)\b/g, '$1_{$2}')

  value = value.replace(/\[([0-9.,\s+-]+)\]/g, (full, body: string) => {
    const items = body
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
    if (
      items.length < 2 ||
      items.length > 6 ||
      !items.every((item) => /^[-+]?\d+(?:\.\d+)?$/.test(item))
    ) {
      return full
    }
    return `\\begin{bmatrix}${items.join('\\\\')}\\end{bmatrix}`
  })

  value = value
    .replace(/\*/g, '\\cdot ')
    .replace(/%/g, '\\%')
    .replace(/\s+/g, ' ')
    .replace(/\\cdot\s+\\cdot/g, '\\cdot')
    .trim()

  if (!value) return null
  if (hasCodeKeywords(value)) return null
  return value
}

function escapeMathText(value: string): string {
  return value.replace(/[\\{}%#$&_]/g, (char) => `\\${char}`).replace(/\s+/g, ' ').trim()
}

function convertMathBlockLine(line: string): string | null {
  const label = /^([A-Za-z][A-Za-z0-9_ ]{1,32})\s*=\s*(.+)$/.exec(line)
  if (label && !hasCodeKeywords(line) && !/[{};]/.test(line)) {
    const rhs = formulaToLatex(label[2])
    if (rhs && isValidMath(label[2]) && unknownMathWords(label[2]).length === 0) {
      return `\\text{${escapeMathText(label[1].trim())}} = ${rhs}`
    }
  }

  if (!isValidMath(line) || unknownMathWords(line).length !== 0) return null
  return formulaToLatex(line)
}

export function looksStandaloneEquation(raw: string): boolean {
  const value = raw.replace(/\s+/g, ' ').trim()
  if (value.length < 5 || value.length > 220) return false
  if (hasCodeKeywords(value)) return false
  if (/^[A-Za-z ]{3,}\b/.test(value) && /\b(?:the|this|that|these|those|a|an|we|you|it|if|when|where|for|from|with|in|on|at|to|of|and|or|but|however|because|then|than|so|also|example|note|step)\b/i.test(value)) {
    return false
  }

  const proseMatches = value.match(new RegExp(`\\b(?:${[...PROSE_WORDS].join('|')})\\b`, 'gi'))
  if (proseMatches && proseMatches.length > 1) return false

  const mathOps = (value.match(/[=+\-*/^<>|[\]]/g) ?? []).length
  const hasFunctionCall = hasFunction(value)
  const hasVector = /\[[0-9,\s.-]+\]/.test(value)

  return hasFunctionCall || mathOps >= 2 || (hasVector && mathOps >= 1)
}

export function hasActualCode(value: string): boolean {
  return hasCodeKeywords(value) || /(?:^|\n)\s*(?:#|\/\/|\/\*|--)/m.test(value) || /[；;{}]/.test(value)
}

export function enhanceElement(element: HTMLElement, render: MathRenderer): boolean {
  if (element.dataset.mathEnhanced === 'true') return false
  if (
    element.closest(
      'pre, code, a, .katex, .math-inline, .math-display, .header-anchor, button, .custom-code-toggle, .copy'
    )
  ) {
    return false
  }

  const text = (element.textContent ?? '').trim()
  if (!text) return false

  if (
    element.matches('p') &&
    !element.querySelector('a, code, .katex') &&
    looksStandaloneEquation(text) &&
    isValidMath(text)
  ) {
    const latex = formulaToLatex(text)
    if (!latex) return false
    const html = render(latex, true)
    if (!html) return false

    element.innerHTML = `<span class="math-display">${html}</span>`
    element.classList.add('math-display-paragraph')
    element.dataset.mathEnhanced = 'true'
    return true
  }

  let changed = false
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
    acceptNode(node: Node): number {
      const parent = node.parentElement
      if (!parent) return NodeFilter.FILTER_REJECT
      if (
        parent.closest(
          'pre, code, a, .katex, .math-inline, .math-display, .header-anchor, button, .custom-code-toggle, .copy'
        )
      ) {
        return NodeFilter.FILTER_REJECT
      }
      return NodeFilter.FILTER_ACCEPT
    }
  })

  const nodes: Text[] = []
  while (walker.nextNode()) nodes.push(walker.currentNode as Text)

  for (const node of nodes) {
    const value = node.nodeValue ?? ''
    const matches = findMathMatches(value)
    if (!matches.length) continue

    const fragment = document.createDocumentFragment()
    let cursor = 0
    let nodeChanged = false

    for (const match of matches) {
      if (match.start < cursor) continue
      const latex = formulaToLatex(match.raw)
      if (!latex) continue
      const html = render(latex, false)
      if (!html) continue

      fragment.appendChild(document.createTextNode(value.slice(cursor, match.start)))
      const span = document.createElement('span')
      span.className = 'math-inline'
      span.dataset.mathSource = match.raw
      span.innerHTML = html
      fragment.appendChild(span)
      cursor = match.end
      nodeChanged = true
    }

    if (!nodeChanged) continue
    fragment.appendChild(document.createTextNode(value.slice(cursor)))
    node.replaceWith(fragment)
    changed = true
  }

  if (changed) element.dataset.mathEnhanced = 'true'
  return changed
}

export function enhanceCodeBlock(element: HTMLElement, render: MathRenderer): boolean {
  if (element.dataset.mathEnhanced === 'true') return false
  if (!element.matches("div[class*='language-']")) return false
  if (!element.classList.contains('language-') && !element.classList.contains('language-text')) {
    return false
  }

  const code = element.querySelector('pre code')
  if (!code) return false

  const text = (code.textContent ?? '').replace(/\r\n/g, '\n').trim()
  if (!text || text.length > 320 || hasActualCode(text)) return false

  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length === 0 || lines.length > 8) return false

  const converted = lines.map((line) => convertMathBlockLine(line))
  if (converted.some((line) => !line)) return false

  const latex =
    converted.length === 1
      ? converted[0]!
      : `\\begin{aligned}${converted.join(' \\\\ ')}\\end{aligned}`
  const html = render(latex, true)
  if (!html) return false

  const replacement = document.createElement('div')
  replacement.className = 'math-display-block'
  replacement.dataset.mathEnhanced = 'true'
  replacement.innerHTML = `<span class="math-display">${html}</span>`
  element.replaceWith(replacement)
  return true
}
