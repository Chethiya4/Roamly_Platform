import bs4
with open('registration.html', 'r', encoding='utf-8') as f:
    soup = bs4.BeautifulSoup(f, 'html.parser')

# Add error banner
form_container = soup.find('div', class_='form-container')
form = soup.find('form', id='registrationForm')
error_banner = soup.new_tag('div')
error_banner['id'] = 'errorBanner'
error_banner['style'] = 'display: none; background: #ffebee; color: #c62828; padding: 12px; border-radius: 8px; margin-bottom: 20px; text-align: center; font-weight: 600;'
form.insert_before(error_banner)

# Mapping labels to names
label_to_name = {
    'Business Name': 'businessName',
    'Business Category': 'category',
    'Business Registration Number (Optional)': 'registrationNumber',
    'Business Description': 'description',
    'Owner Full Name': 'ownerFullName',
    'NIC / Passport Number (Optional)': 'ownerNIC',
    'Personal Email Address': 'personalEmail',
    'Personal Mobile Number': 'personalMobile',
    'Province': 'province',
    'District': 'district',
    'City / Town': 'city',
    'Postal Code': 'postalCode',
    'Street Address': 'streetAddress',
    'Google Maps Latitude': 'latitude',
    'Google Maps Longitude': 'longitude',
    'Business Phone Number': 'businessPhone',
    'WhatsApp Number': 'whatsapp',
    'Business Email': 'businessEmail',
    'Website (Optional)': 'website',
    'Opening Time': 'openTime',
    'Closing Time': 'closeTime',
    'Open Days': 'openDays',
    'General Price Range': 'priceTier',
    'Starting Price (LKR) (Optional)': 'startingPriceLKR',
    'Business Logo': 'logo',
    'Cover Image (For Profile Header)': 'cover',
    'Gallery Images (Upload Multiple)': 'gallery',
    'Facebook Profile/Page URL': 'facebook',
    'Instagram URL': 'instagram',
    'TikTok URL': 'tiktok',
    'YouTube Channel URL': 'youtube',
    'Password': 'password',
    'Confirm Password': 'confirmPassword',
    'Upload Business License (PDF or Image)': 'license',
    'Upload Owner NIC / Passport (Optional)': 'nic'
}

for group in soup.find_all('div', class_='form-group'):
    label = group.find('label')
    if label:
        # Get label text properly formatted
        text = ' '.join(label.stripped_strings)
        if text in label_to_name:
            input_tag = group.find(['input', 'select', 'textarea'])
            if input_tag:
                input_tag['name'] = label_to_name[text]
        elif text == 'Account Username':
            # Remove Account Username
            group.decompose()
        elif text == 'We are open 24 Hours':
            inp = group.find('input')
            if inp:
                inp['name'] = 'open24'
                inp['value'] = 'true'
        elif 'I confirm that the information provided is accurate' in text:
            inp = group.find('input')
            if inp:
                inp['name'] = 'termsAgreed'
                inp['value'] = 'true'

# Facilities checkbox names & values
for lbl in soup.find_all('label', class_='checkbox-label'):
    text = lbl.get_text(strip=True)
    if text != 'We are open 24 Hours' and 'I confirm that' not in text:
        inp = lbl.find('input')
        if inp:
            inp['name'] = 'facilities'
            inp['value'] = text

# Add note under Account Setup
account_setup_section = soup.find('h2', string=lambda t: t and 'Account Setup' in t)
if account_setup_section:
    section_div = account_setup_section.parent
    p = soup.new_tag('p')
    p['style'] = 'color: var(--ink-soft); margin-bottom: 20px; font-size: 0.95rem;'
    p.string = "You'll log in with the Personal Email Address from Section 2."
    account_setup_section.find_next_sibling('p').decompose() # remove old description
    account_setup_section.insert_after(p)

# Replace JS
script_tag = soup.find_all('script')[-1] # The last script block
script_tag.clear()
script_tag.string = """
    document.getElementById('registrationForm').addEventListener('submit', async function(e) {
      e.preventDefault();
      const errorBanner = document.getElementById('errorBanner');
      errorBanner.style.display = 'none';

      const password = document.querySelector('input[name="password"]').value;
      const confirmPassword = document.querySelector('input[name="confirmPassword"]').value;
      
      if (password !== confirmPassword) {
          errorBanner.textContent = "Passwords do not match.";
          errorBanner.style.display = 'block';
          errorBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
      }

      // Collect multiple facilities manually to create JSON array string
      const formData = new FormData(this);
      const facilities = formData.getAll('facilities');
      formData.delete('facilities'); // remove individual
      if (facilities.length > 0) {
          formData.append('facilities', JSON.stringify(facilities));
      }

      // Optional logic for file inputs - remove if empty to avoid sending empty files
      if (document.querySelector('input[name="nic"]').files.length === 0) formData.delete('nic');

      try {
          const res = await fetch('/api/business/register', {
              method: 'POST',
              body: formData
          });
          const data = await res.json();
          if (data.success) {
              localStorage.setItem('roamly_token', data.token);
              
              // Show success message
              this.style.display = 'none';
              const title = document.querySelector('.form-container h1');
              const subtitle = document.querySelector('.form-container p');
              if (title) title.style.display = 'none';
              if (subtitle) subtitle.style.display = 'none';
              
              const successMsg = document.getElementById('successMessage');
              successMsg.style.display = 'block';
              window.scrollTo({ top: 0, behavior: 'smooth' });
              
              setTimeout(() => {
                  window.location.href = 'business-dashboard.html';
              }, 2500); // Redirect after short delay
          } else {
              errorBanner.textContent = data.message || "Registration failed.";
              errorBanner.style.display = 'block';
              errorBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
      } catch (err) {
          errorBanner.textContent = "An error occurred during registration. Please try again.";
          errorBanner.style.display = 'block';
          errorBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
"""

with open('registration.html', 'w', encoding='utf-8') as f:
    f.write(str(soup))
