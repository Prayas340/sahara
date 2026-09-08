// Complete list of all 36 Indian States & Union Territories
export const ALL_STATES = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal'
];

// Comprehensive list of cities covering all 36 States & Union Territories across India
export const ALL_CITIES = [
  // Assam
  { city: 'Guwahati', state: 'Assam' },
  { city: 'Silchar', state: 'Assam' },
  { city: 'Dibrugarh', state: 'Assam' },
  { city: 'Jorhat', state: 'Assam' },
  { city: 'Nagaon', state: 'Assam' },
  { city: 'Tinsukia', state: 'Assam' },
  { city: 'Tezpur', state: 'Assam' },
  { city: 'Bongaigaon', state: 'Assam' },
  { city: 'Diphu', state: 'Assam' },
  { city: 'Dhubri', state: 'Assam' },
  { city: 'North Lakhimpur', state: 'Assam' },
  { city: 'Sivasagar', state: 'Assam' },
  { city: 'Goalpara', state: 'Assam' },
  { city: 'Karimganj', state: 'Assam' },
  { city: 'Golaghat', state: 'Assam' },
  { city: 'Barpeta', state: 'Assam' },
  { city: 'Haflong', state: 'Assam' },
  { city: 'Mangaldai', state: 'Assam' },
  { city: 'Hojai', state: 'Assam' },
  { city: 'Kokrajhar', state: 'Assam' },
  { city: 'Morigaon', state: 'Assam' },
  { city: 'Nalbari', state: 'Assam' },
  { city: 'Rangia', state: 'Assam' },

  // West Bengal
  { city: 'Kolkata', state: 'West Bengal' },
  { city: 'Howrah', state: 'West Bengal' },
  { city: 'Durgapur', state: 'West Bengal' },
  { city: 'Asansol', state: 'West Bengal' },
  { city: 'Siliguri', state: 'West Bengal' },
  { city: 'Bardhaman', state: 'West Bengal' },
  { city: 'Malda', state: 'West Bengal' },
  { city: 'Kharagpur', state: 'West Bengal' },
  { city: 'Jalpaiguri', state: 'West Bengal' },
  { city: 'Darjeeling', state: 'West Bengal' },
  { city: 'Haldia', state: 'West Bengal' },
  { city: 'Baharampur', state: 'West Bengal' },
  { city: 'Cooch Behar', state: 'West Bengal' },
  { city: 'Krishnanagar', state: 'West Bengal' },
  { city: 'Midnapore', state: 'West Bengal' },
  { city: 'Shantipur', state: 'West Bengal' },
  { city: 'Alipurduar', state: 'West Bengal' },

  // Delhi & NCR
  { city: 'New Delhi', state: 'Delhi' },
  { city: 'Central Delhi', state: 'Delhi' },
  { city: 'North Delhi', state: 'Delhi' },
  { city: 'South Delhi', state: 'Delhi' },
  { city: 'East Delhi', state: 'Delhi' },
  { city: 'West Delhi', state: 'Delhi' },
  { city: 'Dwarka', state: 'Delhi' },
  { city: 'Rohini', state: 'Delhi' },

  // Maharashtra
  { city: 'Mumbai', state: 'Maharashtra' },
  { city: 'Pune', state: 'Maharashtra' },
  { city: 'Nagpur', state: 'Maharashtra' },
  { city: 'Thane', state: 'Maharashtra' },
  { city: 'Nashik', state: 'Maharashtra' },
  { city: 'Aurangabad (Chhatrapati Sambhajinagar)', state: 'Maharashtra' },
  { city: 'Navi Mumbai', state: 'Maharashtra' },
  { city: 'Solapur', state: 'Maharashtra' },
  { city: 'Kolhapur', state: 'Maharashtra' },
  { city: 'Amravati', state: 'Maharashtra' },
  { city: 'Nanded', state: 'Maharashtra' },
  { city: 'Akola', state: 'Maharashtra' },
  { city: 'Sangli', state: 'Maharashtra' },
  { city: 'Jalgaon', state: 'Maharashtra' },
  { city: 'Latur', state: 'Maharashtra' },
  { city: 'Dhule', state: 'Maharashtra' },
  { city: 'Ahmednagar', state: 'Maharashtra' },
  { city: 'Chandrapur', state: 'Maharashtra' },

  // Karnataka
  { city: 'Bengaluru', state: 'Karnataka' },
  { city: 'Mysuru', state: 'Karnataka' },
  { city: 'Hubballi-Dharwad', state: 'Karnataka' },
  { city: 'Mangaluru', state: 'Karnataka' },
  { city: 'Belagavi', state: 'Karnataka' },
  { city: 'Kalaburagi', state: 'Karnataka' },
  { city: 'Davanagere', state: 'Karnataka' },
  { city: 'Ballari', state: 'Karnataka' },
  { city: 'Vijayapura', state: 'Karnataka' },
  { city: 'Shivamogga', state: 'Karnataka' },
  { city: 'Tumakuru', state: 'Karnataka' },
  { city: 'Udupi', state: 'Karnataka' },

  // Tamil Nadu
  { city: 'Chennai', state: 'Tamil Nadu' },
  { city: 'Coimbatore', state: 'Tamil Nadu' },
  { city: 'Madurai', state: 'Tamil Nadu' },
  { city: 'Tiruchirappalli', state: 'Tamil Nadu' },
  { city: 'Salem', state: 'Tamil Nadu' },
  { city: 'Tiruppur', state: 'Tamil Nadu' },
  { city: 'Erode', state: 'Tamil Nadu' },
  { city: 'Tirunelveli', state: 'Tamil Nadu' },
  { city: 'Vellore', state: 'Tamil Nadu' },
  { city: 'Thoothukudi', state: 'Tamil Nadu' },
  { city: 'Thanjavur', state: 'Tamil Nadu' },
  { city: 'Kanchipuram', state: 'Tamil Nadu' },
  { city: 'Ooty', state: 'Tamil Nadu' },

  // Uttar Pradesh
  { city: 'Lucknow', state: 'Uttar Pradesh' },
  { city: 'Kanpur', state: 'Uttar Pradesh' },
  { city: 'Ghaziabad', state: 'Uttar Pradesh' },
  { city: 'Agra', state: 'Uttar Pradesh' },
  { city: 'Varanasi', state: 'Uttar Pradesh' },
  { city: 'Meerut', state: 'Uttar Pradesh' },
  { city: 'Prayagraj', state: 'Uttar Pradesh' },
  { city: 'Bareilly', state: 'Uttar Pradesh' },
  { city: 'Aligarh', state: 'Uttar Pradesh' },
  { city: 'Moradabad', state: 'Uttar Pradesh' },
  { city: 'Gorakhpur', state: 'Uttar Pradesh' },
  { city: 'Noida', state: 'Uttar Pradesh' },
  { city: 'Greater Noida', state: 'Uttar Pradesh' },
  { city: 'Jhansi', state: 'Uttar Pradesh' },
  { city: 'Mathura', state: 'Uttar Pradesh' },
  { city: 'Ayodhya', state: 'Uttar Pradesh' },

  // Gujarat
  { city: 'Ahmedabad', state: 'Gujarat' },
  { city: 'Surat', state: 'Gujarat' },
  { city: 'Vadodara', state: 'Gujarat' },
  { city: 'Rajkot', state: 'Gujarat' },
  { city: 'Bhavnagar', state: 'Gujarat' },
  { city: 'Jamnagar', state: 'Gujarat' },
  { city: 'Gandhinagar', state: 'Gujarat' },
  { city: 'Junagadh', state: 'Gujarat' },
  { city: 'Anand', state: 'Gujarat' },
  { city: 'Navsari', state: 'Gujarat' },
  { city: 'Morbi', state: 'Gujarat' },
  { city: 'Bharuch', state: 'Gujarat' },
  { city: 'Bhuj', state: 'Gujarat' },
  { city: 'Porbandar', state: 'Gujarat' },
  { city: 'Vapi', state: 'Gujarat' },

  // Rajasthan
  { city: 'Jaipur', state: 'Rajasthan' },
  { city: 'Jodhpur', state: 'Rajasthan' },
  { city: 'Kota', state: 'Rajasthan' },
  { city: 'Bikaner', state: 'Rajasthan' },
  { city: 'Ajmer', state: 'Rajasthan' },
  { city: 'Udaipur', state: 'Rajasthan' },
  { city: 'Bhilwara', state: 'Rajasthan' },
  { city: 'Alwar', state: 'Rajasthan' },
  { city: 'Bharatpur', state: 'Rajasthan' },
  { city: 'Sikar', state: 'Rajasthan' },
  { city: 'Sri Ganganagar', state: 'Rajasthan' },
  { city: 'Jaisalmer', state: 'Rajasthan' },

  // Telangana
  { city: 'Hyderabad', state: 'Telangana' },
  { city: 'Warangal', state: 'Telangana' },
  { city: 'Nizamabad', state: 'Telangana' },
  { city: 'Khammam', state: 'Telangana' },
  { city: 'Karimnagar', state: 'Telangana' },
  { city: 'Ramagundam', state: 'Telangana' },
  { city: 'Mahbubnagar', state: 'Telangana' },

  // Andhra Pradesh
  { city: 'Visakhapatnam', state: 'Andhra Pradesh' },
  { city: 'Vijayawada', state: 'Andhra Pradesh' },
  { city: 'Guntur', state: 'Andhra Pradesh' },
  { city: 'Nellore', state: 'Andhra Pradesh' },
  { city: 'Kurnool', state: 'Andhra Pradesh' },
  { city: 'Kakinada', state: 'Andhra Pradesh' },
  { city: 'Rajahmundry', state: 'Andhra Pradesh' },
  { city: 'Tirupati', state: 'Andhra Pradesh' },
  { city: 'Kadapa', state: 'Andhra Pradesh' },
  { city: 'Anantapur', state: 'Andhra Pradesh' },

  // Kerala
  { city: 'Thiruvananthapuram', state: 'Kerala' },
  { city: 'Kochi', state: 'Kerala' },
  { city: 'Kozhikode', state: 'Kerala' },
  { city: 'Kollam', state: 'Kerala' },
  { city: 'Thrissur', state: 'Kerala' },
  { city: 'Kannur', state: 'Kerala' },
  { city: 'Alappuzha', state: 'Kerala' },
  { city: 'Kottayam', state: 'Kerala' },
  { city: 'Palakkad', state: 'Kerala' },

  // Madhya Pradesh
  { city: 'Bhopal', state: 'Madhya Pradesh' },
  { city: 'Indore', state: 'Madhya Pradesh' },
  { city: 'Jabalpur', state: 'Madhya Pradesh' },
  { city: 'Gwalior', state: 'Madhya Pradesh' },
  { city: 'Ujjain', state: 'Madhya Pradesh' },
  { city: 'Sagar', state: 'Madhya Pradesh' },
  { city: 'Satna', state: 'Madhya Pradesh' },
  { city: 'Ratlam', state: 'Madhya Pradesh' },
  { city: 'Rewa', state: 'Madhya Pradesh' },

  // Bihar
  { city: 'Patna', state: 'Bihar' },
  { city: 'Gaya', state: 'Bihar' },
  { city: 'Bhagalpur', state: 'Bihar' },
  { city: 'Muzaffarpur', state: 'Bihar' },
  { city: 'Purnia', state: 'Bihar' },
  { city: 'Darbhanga', state: 'Bihar' },
  { city: 'Bihar Sharif', state: 'Bihar' },
  { city: 'Arrah', state: 'Bihar' },
  { city: 'Begusarai', state: 'Bihar' },
  { city: 'Katihar', state: 'Bihar' },
  { city: 'Munger', state: 'Bihar' },
  { city: 'Chhapra', state: 'Bihar' },

  // Punjab
  { city: 'Ludhiana', state: 'Punjab' },
  { city: 'Amritsar', state: 'Punjab' },
  { city: 'Jalandhar', state: 'Punjab' },
  { city: 'Patiala', state: 'Punjab' },
  { city: 'Bathinda', state: 'Punjab' },
  { city: 'Mohali', state: 'Punjab' },
  { city: 'Hoshiarpur', state: 'Punjab' },
  { city: 'Pathankot', state: 'Punjab' },

  // Haryana
  { city: 'Gurugram', state: 'Haryana' },
  { city: 'Faridabad', state: 'Haryana' },
  { city: 'Panipat', state: 'Haryana' },
  { city: 'Ambala', state: 'Haryana' },
  { city: 'Yamunanagar', state: 'Haryana' },
  { city: 'Rohtak', state: 'Haryana' },
  { city: 'Hisar', state: 'Haryana' },
  { city: 'Karnal', state: 'Haryana' },
  { city: 'Sonipat', state: 'Haryana' },
  { city: 'Panchkula', state: 'Haryana' },

  // Odisha
  { city: 'Bhubaneswar', state: 'Odisha' },
  { city: 'Cuttack', state: 'Odisha' },
  { city: 'Rourkela', state: 'Odisha' },
  { city: 'Berhampur', state: 'Odisha' },
  { city: 'Sambalpur', state: 'Odisha' },
  { city: 'Puri', state: 'Odisha' },
  { city: 'Balasore', state: 'Odisha' },

  // Jharkhand
  { city: 'Ranchi', state: 'Jharkhand' },
  { city: 'Jamshedpur', state: 'Jharkhand' },
  { city: 'Dhanbad', state: 'Jharkhand' },
  { city: 'Bokaro Steel City', state: 'Jharkhand' },
  { city: 'Deoghar', state: 'Jharkhand' },
  { city: 'Hazaribagh', state: 'Jharkhand' },

  // Chhattisgarh
  { city: 'Raipur', state: 'Chhattisgarh' },
  { city: 'Bhilai', state: 'Chhattisgarh' },
  { city: 'Bilaspur', state: 'Chhattisgarh' },
  { city: 'Korba', state: 'Chhattisgarh' },
  { city: 'Rajnandgaon', state: 'Chhattisgarh' },

  // Uttarakhand
  { city: 'Dehradun', state: 'Uttarakhand' },
  { city: 'Haridwar', state: 'Uttarakhand' },
  { city: 'Roorkee', state: 'Uttarakhand' },
  { city: 'Haldwani', state: 'Uttarakhand' },
  { city: 'Rishikesh', state: 'Uttarakhand' },
  { city: 'Nainital', state: 'Uttarakhand' },
  { city: 'Mussoorie', state: 'Uttarakhand' },

  // Himachal Pradesh
  { city: 'Shimla', state: 'Himachal Pradesh' },
  { city: 'Dharamshala', state: 'Himachal Pradesh' },
  { city: 'Solan', state: 'Himachal Pradesh' },
  { city: 'Mandi', state: 'Himachal Pradesh' },
  { city: 'Kullu', state: 'Himachal Pradesh' },
  { city: 'Manali', state: 'Himachal Pradesh' },

  // Jammu and Kashmir
  { city: 'Srinagar', state: 'Jammu and Kashmir' },
  { city: 'Jammu', state: 'Jammu and Kashmir' },
  { city: 'Anantnag', state: 'Jammu and Kashmir' },
  { city: 'Baramulla', state: 'Jammu and Kashmir' },
  { city: 'Udhampur', state: 'Jammu and Kashmir' },

  // Goa
  { city: 'Panaji', state: 'Goa' },
  { city: 'Margao', state: 'Goa' },
  { city: 'Vasco da Gama', state: 'Goa' },
  { city: 'Mapusa', state: 'Goa' },

  // Manipur
  { city: 'Imphal', state: 'Manipur' },
  { city: 'Churachandpur', state: 'Manipur' },
  { city: 'Thoubal', state: 'Manipur' },
  { city: 'Bishnupur', state: 'Manipur' },
  { city: 'Kakching', state: 'Manipur' },
  { city: 'Ukhrul', state: 'Manipur' },

  // Meghalaya
  { city: 'Shillong', state: 'Meghalaya' },
  { city: 'Tura', state: 'Meghalaya' },
  { city: 'Jowai', state: 'Meghalaya' },
  { city: 'Nongpoh', state: 'Meghalaya' },
  { city: 'Cherrapunji', state: 'Meghalaya' },

  // Tripura
  { city: 'Agartala', state: 'Tripura' },
  { city: 'Dharmanagar', state: 'Tripura' },
  { city: 'Udaipur', state: 'Tripura' },
  { city: 'Kailashahar', state: 'Tripura' },

  // Nagaland
  { city: 'Kohima', state: 'Nagaland' },
  { city: 'Dimapur', state: 'Nagaland' },
  { city: 'Mokokchung', state: 'Nagaland' },
  { city: 'Tuensang', state: 'Nagaland' },

  // Mizoram
  { city: 'Aizawl', state: 'Mizoram' },
  { city: 'Lunglei', state: 'Mizoram' },
  { city: 'Champhai', state: 'Mizoram' },
  { city: 'Serchhip', state: 'Mizoram' },

  // Arunachal Pradesh
  { city: 'Itanagar', state: 'Arunachal Pradesh' },
  { city: 'Naharlagun', state: 'Arunachal Pradesh' },
  { city: 'Pasighat', state: 'Arunachal Pradesh' },
  { city: 'Tawang', state: 'Arunachal Pradesh' },
  { city: 'Ziro', state: 'Arunachal Pradesh' },

  // Sikkim
  { city: 'Gangtok', state: 'Sikkim' },
  { city: 'Namchi', state: 'Sikkim' },
  { city: 'Geyzing', state: 'Sikkim' },

  // Union Territories
  { city: 'Chandigarh', state: 'Chandigarh' },
  { city: 'Puducherry', state: 'Puducherry' },
  { city: 'Leh', state: 'Ladakh' },
  { city: 'Kargil', state: 'Ladakh' },
  { city: 'Port Blair', state: 'Andaman and Nicobar Islands' },
  { city: 'Daman', state: 'Dadra and Nagar Haveli and Daman and Diu' },
  { city: 'Diu', state: 'Dadra and Nagar Haveli and Daman and Diu' },
  { city: 'Silvassa', state: 'Dadra and Nagar Haveli and Daman and Diu' },
  { city: 'Kavaratti', state: 'Lakshadweep' }
];

export const INDIAN_STATES = ALL_STATES.map((name) => ({ name }));

export function getCitiesForState(stateName) {
  const filtered = ALL_CITIES.filter((c) => c.state === stateName).map((c) => c.city);
  return filtered.length > 0 ? filtered : ['Main District', 'Central Town'];
}

