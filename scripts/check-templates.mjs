import { BUSINESS_TEMPLATES } from '../src/data/businessTemplates.js';
import { validateProfile } from '../src/services/validation.js';
let bad = 0;
for (const t of BUSINESS_TEMPLATES) {
  const r = validateProfile(t.profile);
  if (!r.valid) { bad++; console.log('INVALID', t.id, r.errors); }
}
console.log(bad ? `${bad} invalid templates` : `all ${BUSINESS_TEMPLATES.length} templates pass validation`);
process.exit(bad ? 1 : 0);
