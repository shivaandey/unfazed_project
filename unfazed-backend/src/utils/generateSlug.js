const Therapist = require('../models/Therapist');

const generateSlug = async (name) => {
  const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  let slug = baseSlug;
  let isUnique = false;
  let counter = 0;

  while (!isUnique) {
    const existing = await Therapist.findOne({ slug });
    if (!existing) {
      isUnique = true;
    } else {
      counter++;
      slug = `${baseSlug}-${counter}`;
    }
  }
  return slug;
};

module.exports = generateSlug;