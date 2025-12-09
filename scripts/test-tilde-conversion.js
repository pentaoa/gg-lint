// Test mathml-to-latex with the tilde symbol and fix
const { MathMLToLaTeX } = require('mathml-to-latex');

function fixLaTeXCommands(latex) {
  const commandsToFix = [
    'sim', 'approx', 'equiv', 'cong', 'propto',
    'leq', 'geq', 'neq', 'subset', 'supset',
    'in', 'ni', 'notin', 'cup', 'cap',
    'infty', 'partial', 'nabla', 'forall', 'exists',
    'alpha', 'beta', 'gamma', 'delta', 'epsilon',
    'theta', 'lambda', 'mu', 'sigma', 'omega',
    'sum', 'prod', 'int', 'lim', 'max', 'min',
    'sin', 'cos', 'tan', 'log', 'ln', 'exp'
  ];
  
  let fixed = latex;
  commandsToFix.forEach(cmd => {
    const regex = new RegExp(`(?<![\\\\a-zA-Z])\\b${cmd}\\b(?![a-zA-Z])`, 'g');
    fixed = fixed.replace(regex, `\\${cmd}`);
  });
  
  return fixed;
}

const mathml = `<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>x</mi><mi>T</mi></msub><mo>∼</mo><mi mathvariant="script">N</mi><mo stretchy="false">(</mo><mn>0</mn><mo separator="true">,</mo><mi>I</mi><mo stretchy="false">)</mo></mrow></semantics></math>`;

try {
  const latex = MathMLToLaTeX.convert(mathml);
  const fixed = fixLaTeXCommands(latex);
  
  console.log('Before fix:', latex);
  console.log('After fix :', fixed);
  console.log('Expected  : x_{T} \\sim \\mathcal{N}(0, I)');
  console.log('✓ Fixed!' === (fixed.includes('\\sim') ? '✓ Fixed!' : '✗ Still broken'));
} catch (error) {
  console.error('Conversion error:', error);
}
