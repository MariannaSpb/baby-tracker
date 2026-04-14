/**
 * Accessibility Audit Snippet
 * This script is intended to be injected into a live browser session by the browser_subagent.
 * It uses axe-core (which must be available or injected) to perform an a11y audit.
 */

// Function to run the audit
async function runAxeAudit() {
  if (typeof axe === 'undefined') {
    console.error('axe-core is not loaded in this page. Please inject axe-core first.');
    return;
  }

  console.log('Starting Accessibility Audit...');
  
  const results = await axe.run();
  
  if (results.violations.length === 0) {
    console.log('✅ No accessibility violations found!');
  } else {
    console.warn(`❌ Found ${results.violations.length} accessibility violations:`);
    results.violations.forEach((violation, index) => {
      console.group(`${index + 1}. ${violation.help} (${violation.impact})`);
      console.log(`Description: ${violation.description}`);
      console.log(`Help URL: ${violation.helpUrl}`);
      console.log('Elements affected:');
      violation.nodes.forEach(node => console.log(node.target.toString()));
      console.groupEnd();
    });
  }
}

runAxeAudit();
