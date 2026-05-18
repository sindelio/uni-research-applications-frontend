async function maskPhone(phone) {
  return phone
    .replace(/\D/g, '') // Remove non-digits
    .replace(/(\d{2})(\d)/, '($1) $2') // Add area code parens
    .replace(/(\d{5})(\d)/, '$1-$2') // Add hyphen for 9 digits
    .replace(/(-\d{4})\d+?$/, '$1'); // Limit to 11 digits total
}

export default maskPhone;
