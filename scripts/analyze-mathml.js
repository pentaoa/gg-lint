// Analyze KaTeX structure for LaTeX source extraction
const html = `<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mfrac>...</mfrac></mrow><annotation encoding="application/x-tex">\\frac{\\sum_{i=1}^{n}\\left(\\alpha_{i}^{2}+\\beta_{i}^{3}-\\sqrt{\\gamma_{i}+\\delta_{i}^{2}}\\right)}{\\int_{0}^{1}\\left(e^{x^{2}}+\\frac{\\ln(x+\\theta)}{1+x^{3}}\\right)dx}=\\Omega(n,\\theta)</annotation></semantics></math></span>...`;

console.log('Strategy:');
console.log('1. Check for <annotation encoding="application/x-tex"> in MathML');
console.log('2. This contains the original LaTeX source!');
console.log('3. Extract from semantics > annotation[encoding="application/x-tex"]');
