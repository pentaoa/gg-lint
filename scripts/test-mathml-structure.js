const { JSDOM } = require('jsdom');

const html = `<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mfrac><mstyle scriptlevel="0" displaystyle="true"><munderover><mo>∑</mo><mrow><mi>i</mi><mo>=</mo><mn>1</mn></mrow><mi>n</mi></munderover><mrow><mo fence="true">(</mo><msubsup><mi>α</mi><mi>i</mi><mn>2</mn></msubsup><mo>+</mo><msubsup><mi>β</mi><mi>i</mi><mn>3</mn></msubsup><mo>−</mo><msqrt><mrow><msub><mi>γ</mi><mi>i</mi></msub><mo>+</mo><msubsup><mi>δ</mi><mi>i</mi><mn>2</mn></msubsup></mrow></msqrt><mo fence="true">)</mo></mrow></mstyle><mstyle scriptlevel="0" displaystyle="true"><msubsup><mo>∫</mo><mn>0</mn><mn>1</mn></msubsup><mrow><mo fence="true">(</mo><msup><mi>e</mi><msup><mi>x</mi><mn>2</mn></msup></msup><mo>+</mo><mfrac><mrow><mi>ln</mi><mo>⁡</mo><mo stretchy="false">(</mo><mi>x</mi><mo>+</mo><mi>θ</mi><mo stretchy="false">)</mo></mrow><mrow><mn>1</mn><mo>+</mo><msup><mi>x</mi><mn>3</mn></msup></mrow></mfrac><mo fence="true">)</mo></mrow><mi>d</mi><mi>x</mi></mstyle></mfrac><mo>=</mo><mi mathvariant="normal">Ω</mi><mo stretchy="false">(</mo><mi>n</mi><mo separator="true">,</mo><mi>θ</mi><mo stretchy="false">)</mo></mrow></semantics></math></span></span></span>`;

const dom = new JSDOM(html);
const doc = dom.window.document;

console.log('Checking for annotation node:');
const annotation = doc.querySelector('annotation[encoding="application/x-tex"]');
console.log('Found annotation:', !!annotation);

console.log('\nChecking MathML structure:');
const mathml = doc.querySelector('.katex-mathml math');
console.log('Has math element:', !!mathml);
console.log('Math innerHTML length:', mathml?.innerHTML.length);

console.log('\nChecking for mfrac (fraction):');
const mfrac = doc.querySelector('mfrac');
console.log('Found mfrac:', !!mfrac);

console.log('\nChecking for munderover (sum with limits):');
const munderover = doc.querySelector('munderover');
console.log('Found munderover:', !!munderover);
if (munderover) {
  console.log('munderover structure:', munderover.outerHTML.substring(0, 200));
}

console.log('\n==> Problem: No annotation tag, need to reconstruct LaTeX from MathML structure');
