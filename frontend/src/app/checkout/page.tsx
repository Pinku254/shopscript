'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

import Notification from '@/components/Notification';

export default function CheckoutPage() {
    const { cartItems, cartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const router = useRouter();

    const [step, setStep] = useState(1); // 1: Address, 2: Payment, 3: Success

    // Address Form State
    const [fullName, setFullName] = useState('');
    const [addressLine1, setAddressLine1] = useState('');
    const [addressLine2, setAddressLine2] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [district, setDistrict] = useState('');
    const [zipCode, setZipCode] = useState('');
    const [mobile, setMobile] = useState('');
    const [altMobile, setAltMobile] = useState('');

    const [paymentMethod, setPaymentMethod] = useState('Credit Card');

    // Notification State
    const [notification, setNotification] = useState({
        message: '',
        type: 'info' as 'success' | 'error' | 'info',
        isVisible: false
    });

    const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
        setNotification({ message, type, isVisible: true });
    };

    const closeNotification = () => {
        setNotification(prev => ({ ...prev, isVisible: false }));
    };

    // Comprehensive Data for India
    const statesAndDistricts: Record<string, string[]> = {
        "Andhra Pradesh": ["Anantapur", "Chittoor", "East Godavari", "Guntur", "Krishna", "Kurnool", "Prakasam", "Srikakulam", "Sri Potti Sriramulu Nellore", "Visakhapatnam", "Vizianagaram", "West Godavari", "YSR Kadapa"],
        "Arunachal Pradesh": ["Tawang", "West Kameng", "East Kameng", "Pakke Kessang", "Papum Pare", "Kurung Kumey", "Kra Daadi", "Lower Subansiri", "Kamle", "Upper Subansiri", "West Siang", "East Siang", "Siang", "Upper Siang", "Lower Siang", "Lepa Rada", "Shi Yomi", "Dibang Valley", "Lower Dibang Valley", "Lohit", "Anjaw", "Namsai", "Changlang", "Tirap", "Longding"],
        "Assam": ["Baksa", "Barpeta", "Biswanath", "Bongaigaon", "Cachar", "Charaideo", "Chirang", "Darrang", "Dhemaji", "Dhubri", "Dibrugarh", "Dima Hasao", "Goalpara", "Golaghat", "Hailakandi", "Hojai", "Jorhat", "Kamrup", "Kamrup Metropolitan", "Karbi Anglong", "Karimganj", "Kokrajhar", "Lakhimpur", "Majuli", "Morigaon", "Nagaon", "Nalbari", "Sivasagar", "Sonitpur", "South Salmara-Mankachar", "Tinsukia", "Udalguri", "West Karbi Anglong"],
        "Bihar": ["Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur", "Buxar", "Darbhanga", "East Champaran", "Gaya", "Gopalganj", "Jamui", "Jehanabad", "Kaimur", "Katihar", "Khagaria", "Kishanganj", "Lakhisarai", "Madhepura", "Madhubani", "Munger", "Muzaffarpur", "Nalanda", "Nawada", "Patna", "Purnia", "Rohtas", "Saharsa", "Samastipur", "Saran", "Sheikhpura", "Sheohar", "Sitamarhi", "Siwan", "Supaul", "Vaishali", "West Champaran"],
        "Chhattisgarh": ["Balod", "Baloda Bazar", "Balrampur", "Bastar", "Bemetara", "Bijapur", "Bilaspur", "Dantewada", "Dhamtari", "Durg", "Gariaband", "Gaurela-Pendra-Marwahi", "Janjgir-Champa", "Jashpur", "Kabirdham", "Kanker", "Kondagaon", "Korba", "Koriya", "Mahasamund", "Mungeli", "Narayanpur", "Raigarh", "Raipur", "Rajnandgaon", "Sukma", "Surajpur", "Surguja"],
        "Goa": ["North Goa", "South Goa"],
        "Gujarat": ["Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha", "Bharuch", "Bhavnagar", "Botad", "Chhota Udaipur", "Dahod", "Dang", "Devbhoomi Dwarka", "Gandhinagar", "Gir Somnath", "Jamnagar", "Junagadh", "Kheda", "Kutch", "Mahisagar", "Mehsana", "Morbi", "Narmada", "Navsari", "Panchmahal", "Patan", "Porbandar", "Rajkot", "Sabarkantha", "Surat", "Surendranagar", "Tapi", "Vadodara", "Valsad"],
        "Haryana": ["Ambala", "Bhiwani", "Charkhi Dadri", "Faridabad", "Fatehabad", "Gurugram", "Hisar", "Jhajjar", "Jind", "Kaithal", "Karnal", "Kurukshetra", "Mahendragarh", "Nuh", "Palwal", "Panchkula", "Panipat", "Rewari", "Rohtak", "Sirsa", "Sonipat", "Yamunanagar"],
        "Himachal Pradesh": ["Bilaspur", "Chamba", "Hamirpur", "Kangra", "Kinnaur", "Kullu", "Lahaul and Spiti", "Mandi", "Shimla", "Sirmaur", "Solan", "Una"],
        "Jharkhand": ["Bokaro", "Chatra", "Deoghar", "Dhanbad", "Dumka", "East Singhbhum", "Garhwa", "Giridih", "Godda", "Gumla", "Hazaribagh", "Jamtara", "Khunti", "Koderma", "Latehar", "Lohardaga", "Pakur", "Palamu", "Ramgarh", "Ranchi", "Sahibganj", "Seraikela Kharsawan", "Simdega", "West Singhbhum"],
        "Karnataka": ["Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban", "Bidar", "Chamarajanagar", "Chikkaballapur", "Chikkamagaluru", "Chitradurga", "Dakshina Kannada", "Davangere", "Dharwad", "Gadag", "Hassan", "Haveri", "Kalaburagi", "Kodagu", "Kolar", "Koppal", "Mandya", "Mysuru", "Raichur", "Ramanagara", "Shivamogga", "Tumakuru", "Udupi", "Uttara Kannada", "Vijayapura", "Yadgir"],
        "Kerala": ["Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam", "Kottayam", "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta", "Thiruvananthapuram", "Thrissur", "Wayanad"],
        "Madhya Pradesh": ["Agar Malwa", "Alirajpur", "Anuppur", "Ashoknagar", "Balaghat", "Barwani", "Betul", "Bhind", "Bhopal", "Burhanpur", "Chhatarpur", "Chhindwara", "Damoh", "Datia", "Dewas", "Dhar", "Dindori", "Guna", "Gwalior", "Harda", "Hoshangabad", "Indore", "Jabalpur", "Jhabua", "Katni", "Khandwa", "Khargone", "Mandla", "Mandsaur", "Morena", "Narsinghpur", "Neemuch", "Panna", "Raisen", "Rajgarh", "Ratlam", "Rewa", "Sagar", "Satna", "Sehore", "Seoni", "Shahdol", "Shajapur", "Sheopur", "Shivpuri", "Sidhi", "Singrauli", "Tikamgarh", "Ujjain", "Umaria", "Vidisha", "Niwari"],
        "Maharashtra": ["Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban", "Nagpur", "Nanded", "Nandurbar", "Nashik", "Osmanabad", "Palghar", "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"],
        "Manipur": ["Bishnupur", "Chandel", "Churachandpur", "Imphal East", "Imphal West", "Jiribam", "Kakching", "Kamjong", "Kangpokpi", "Noney", "Pherzawl", "Senapati", "Tamenglong", "Tengnoupal", "Thoubal", "Ukhrul"],
        "Meghalaya": ["East Garo Hills", "East Jaintia Hills", "East Khasi Hills", "North Garo Hills", "Ri Bhoi", "South Garo Hills", "South West Garo Hills", "South West Khasi Hills", "West Garo Hills", "West Jaintia Hills", "West Khasi Hills"],
        "Mizoram": ["Aizawl", "Champhai", "Hnahthial", "Khawzawl", "Kolasib", "Lawngtlai", "Lunglei", "Mamit", "Saiha", "Saitual", "Serchhip"],
        "Nagaland": ["Dimapur", "Kiphire", "Kohima", "Longleng", "Mokokchung", "Mon", "Noklak", "Peren", "Phek", "Tuensang", "Wokha", "Zunheboto"],
        "Odisha": ["Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh", "Cuttack", "Deogarh", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur", "Jajpur", "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Kendujhar", "Khordha", "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh", "Nuapada", "Puri", "Rayagada", "Sambalpur", "Subarnapur", "Sundargarh"],
        "Punjab": ["Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib", "Fazilka", "Ferozepur", "Gurdaspur", "Hoshiarpur", "Jalandhar", "Kapurthala", "Ludhiana", "Mansa", "Moga", "Muktsar", "Pathankot", "Patiala", "Rupnagar", "Sahibzada Ajit Singh Nagar", "Sangrur", "Shahid Bhagat Singh Nagar", "Sri Muktsar Sahib", "Tarn Taran"],
        "Rajasthan": ["Ajmer", "Alwar", "Banswara", "Baran", "Barmer", "Bharatpur", "Bhilwara", "Bikaner", "Bundi", "Chittorgarh", "Churu", "Dausa", "Dholpur", "Dungarpur", "Hanumangarh", "Jaipur", "Jaisalmer", "Jalore", "Jhalawar", "Jhunjhunu", "Jodhpur", "Karauli", "Kota", "Nagaur", "Pali", "Pratapgarh", "Rajsamand", "Sawai Madhopur", "Sikar", "Sirohi", "Sri Ganganagar", "Tonk", "Udaipur"],
        "Sikkim": ["East Sikkim", "North Sikkim", "South Sikkim", "West Sikkim"],
        "Tamil Nadu": ["Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kanchipuram", "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai", "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai", "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi", "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli", "Tirupattur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar"],
        "Telangana": ["Adilabad", "Bhadradri Kothagudem", "Hyderabad", "Jagtial", "Jangaon", "Jayashankar Bhupalpally", "Jogulamba Gadwal", "Kamareddy", "Karimnagar", "Khammam", "Komaram Bheem", "Mahabubabad", "Mahabubnagar", "Mancherial", "Medak", "Medchal", "Nagarkurnool", "Nalgonda", "Nirmal", "Nizamabad", "Peddapalli", "Rajanna Sircilla", "Rangareddy", "Sangareddy", "Siddipet", "Suryapet", "Vikarabad", "Wanaparthy", "Warangal Rural", "Warangal Urban", "Yadadri Bhuvanagiri"],
        "Tripura": ["Dhalai", "Gomati", "Khowai", "North Tripura", "Sepahijala", "South Tripura", "Unakoti", "West Tripura"],
        "Uttar Pradesh": ["Agra", "Aligarh", "Ambedkar Nagar", "Amethi", "Amroha", "Auraiya", "Ayodhya", "Azamgarh", "Baghpat", "Bahraich", "Ballia", "Balrampur", "Banda", "Barabanki", "Bareilly", "Basti", "Bhadohi", "Bijnor", "Budaun", "Bulandshahr", "Chandauli", "Chitrakoot", "Deoria", "Etah", "Etawah", "Farrukhabad", "Fatehpur", "Firozabad", "Gautam Buddha Nagar", "Ghaziabad", "Ghazipur", "Gonda", "Gorakhpur", "Hamirpur", "Hapur", "Hardoi", "Hathras", "Jalaun", "Jaunpur", "Jhansi", "Kannauj", "Kanpur Dehat", "Kanpur Nagar", "Kasganj", "Kaushambi", "Kheri", "Kushinagar", "Lalitpur", "Lucknow", "Maharajganj", "Mahoba", "Mainpuri", "Mathura", "Mau", "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar", "Pilibhit", "Pratapgarh", "Prayagraj", "Raebareli", "Rampur", "Saharanpur", "Sambhal", "Sant Kabir Nagar", "Shahjahanpur", "Shamli", "Shravasti", "Siddharthnagar", "Sitapur", "Sonbhadra", "Sultanpur", "Unnao", "Varanasi"],
        "Uttarakhand": ["Almora", "Bageshwar", "Chamoli", "Champawat", "Dehradun", "Haridwar", "Nainital", "Pauri Garhwal", "Pithoragarh", "Rudraprayag", "Tehri Garhwal", "Udham Singh Nagar", "Uttarkashi"],
        "West Bengal": ["Alipurduar", "Bankura", "Birbhum", "Cooch Behar", "Dakshin Dinajpur", "Darjeeling", "Hooghly", "Howrah", "Jalpaiguri", "Jhargram", "Kalimpong", "Kolkata", "Malda", "Murshidabad", "Nadia", "North 24 Parganas", "Paschim Bardhaman", "Paschim Medinipur", "Purba Bardhaman", "Purba Medinipur", "Purulia", "South 24 Parganas", "Uttar Dinajpur"],
        "Delhi": ["Central Delhi", "East Delhi", "New Delhi", "North Delhi", "North East Delhi", "North West Delhi", "Shahdara", "South Delhi", "South East Delhi", "South West Delhi", "West Delhi"],
        "Andaman and Nicobar Islands": ["Nicobar", "North and Middle Andaman", "South Andaman"],
        "Chandigarh": ["Chandigarh"],
        "Dadra and Nagar Haveli and Daman and Diu": ["Dadra and Nagar Haveli", "Daman", "Diu"],
        "Jammu and Kashmir": ["Anantnag", "Bandipora", "Baramulla", "Budgam", "Doda", "Ganderbal", "Jammu", "Kathua", "Kishtwar", "Kulgam", "Kupwara", "Poonch", "Pulwama", "Rajouri", "Ramban", "Reasi", "Samba", "Shopian", "Srinagar", "Udhampur"],
        "Ladakh": ["Kargil", "Leh"],
        "Lakshadweep": ["Lakshadweep"],
        "Puducherry": ["Karaikal", "Mahe", "Puducherry", "Yanam"]
    };

    if (cartItems.length === 0 && step !== 3) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                <h2 className="text-2xl font-bold">Your cart is empty</h2>
                <button
                    onClick={() => router.push('/')}
                    className="mt-4 text-indigo-600 hover:text-indigo-500"
                >
                    Continue Shopping
                </button>
            </div>
        );
    }

    const handlePlaceOrder = async () => {
        if (!user) {
            showNotification('Please login to place an order', 'error');
            return;
        }

        const finalAddress = `${fullName}\nMobile: ${mobile}${altMobile ? ', Alt: ' + altMobile : ''}\n${addressLine1}\n${addressLine2 ? addressLine2 + '\n' : ''}${city}, ${district}\n${state} - ${zipCode}`;

        try {
            const orderData = {
                totalAmount: cartTotal,
                status: 'PENDING',
                shippingAddress: finalAddress,
                paymentMethod: paymentMethod,
                paymentStatus: paymentMethod === 'Cash on Delivery' ? 'PENDING' : 'PAID',
                items: cartItems.map(item => ({
                    product: { id: item.product.id },
                    quantity: item.quantity,
                    price: item.price,
                    selectedSize: item.selectedSize
                }))
            };

            // Using user.id if available, otherwise defaulting to 1 for dev if user context is weak
            const userId = user.id || 1;

            await api.post(`/orders/user/${userId}`, orderData);
            clearCart();
            setStep(3);
        } catch (error) {
            console.error('Order failed', error);
            showNotification('Failed to place order. Please try again.', 'error');
        }
    };

    return (
        <div className="max-w-2xl mx-auto pt-16 pb-24 px-4 sm:px-6 lg:max-w-7xl lg:px-8 relative">
            <Notification
                message={notification.message}
                type={notification.type}
                isVisible={notification.isVisible}
                onClose={closeNotification}
            />

            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">Checkout</h1>

            {step === 1 && (
                <div className="mt-12">
                    <div className="mb-6">
                        <button
                            onClick={() => router.back()}
                            className="text-sm text-indigo-600 hover:text-indigo-500 flex items-center"
                        >
                            ← Back
                        </button>
                    </div>
                    <h2 className="text-lg font-medium text-foreground mb-6">Step 1: Shipping Address</h2>

                    <div className="space-y-6">
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-foreground">Full Name *</label>
                            <input
                                type="text"
                                id="fullName"
                                required
                                className="mt-1 block w-full border border-input rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-input text-foreground"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                            />
                        </div>

                        <div>
                            <label htmlFor="addressLine1" className="block text-sm font-medium text-foreground">Address Line 1 *</label>
                            <input
                                type="text"
                                id="addressLine1"
                                required
                                className="mt-1 block w-full border border-input rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-input text-foreground"
                                value={addressLine1}
                                onChange={(e) => setAddressLine1(e.target.value)}
                            />
                        </div>

                        <div>
                            <label htmlFor="mobile" className="block text-sm font-medium text-foreground">Mobile No *</label>
                            <input
                                type="tel"
                                id="mobile"
                                required
                                className="mt-1 block w-full border border-input rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-input text-foreground"
                                value={mobile}
                                onChange={(e) => setMobile(e.target.value)}
                            />
                        </div>

                        <div>
                            <label htmlFor="altMobile" className="block text-sm font-medium text-foreground">Alternative Mobile No (Optional)</label>
                            <input
                                type="tel"
                                id="altMobile"
                                className="mt-1 block w-full border border-input rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-input text-foreground"
                                value={altMobile}
                                onChange={(e) => setAltMobile(e.target.value)}
                            />
                        </div>

                        <div>
                            <label htmlFor="addressLine2" className="block text-sm font-medium text-foreground">Address Line 2 (Optional)</label>
                            <input
                                type="text"
                                id="addressLine2"
                                className="mt-1 block w-full border border-input rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-input text-foreground"
                                value={addressLine2}
                                onChange={(e) => setAddressLine2(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor="state" className="block text-sm font-medium text-foreground">State *</label>
                                <select
                                    id="state"
                                    required
                                    className="mt-1 block w-full border border-input rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-input text-foreground"
                                    value={state}
                                    onChange={(e) => {
                                        setState(e.target.value);
                                        setDistrict(''); // Reset district when state changes
                                    }}
                                >
                                    <option value="">Select State</option>
                                    {Object.keys(statesAndDistricts).map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="district" className="block text-sm font-medium text-foreground">District *</label>
                                <select
                                    id="district"
                                    required
                                    disabled={!state}
                                    className="mt-1 block w-full border border-input rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-input text-foreground disabled:bg-secondary disabled:text-muted-foreground"
                                    value={district}
                                    onChange={(e) => setDistrict(e.target.value)}
                                >
                                    <option value="">Select District</option>
                                    {state && statesAndDistricts[state]?.map((d) => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="city" className="block text-sm font-medium text-foreground">City / Town *</label>
                                <input
                                    type="text"
                                    id="city"
                                    required
                                    className="mt-1 block w-full border border-input rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-input text-foreground"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                />
                            </div>

                            <div>
                                <label htmlFor="zipCode" className="block text-sm font-medium text-foreground">ZIP / Postal Code *</label>
                                <input
                                    type="text"
                                    id="zipCode"
                                    required
                                    className="mt-1 block w-full border border-input rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-input text-foreground"
                                    value={zipCode}
                                    onChange={(e) => setZipCode(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 flex justify-end">
                        <button
                            onClick={() => {
                                if (fullName && addressLine1 && city && state && district && zipCode && mobile) {
                                    setStep(2);
                                } else {
                                    showNotification('Please fill in all required fields.', 'error');
                                }
                            }}
                            className="bg-primary border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-primary-foreground hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                            Next: Payment
                        </button>
                    </div>
                </div>
            )}

            {/* Step 2 and 3 kept but address textarea removed from view since we use the form now */
                /* We need to make sure we don't duplicate render, the above replaces the ENTIRE step 1 block including state logic */
            }
            {step === 2 && (
                <div className="mt-12">
                    <h2 className="text-lg font-medium text-foreground">Step 2: Payment</h2>
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-foreground">Payment Method</label>
                        <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-input focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md border bg-input text-foreground"
                        >
                            <option>Credit Card</option>
                            <option>PayPal</option>
                            <option>Cash on Delivery</option>
                        </select>
                    </div>

                    <div className="mt-8 border-t border-border pt-8">
                        <h3 className="text-lg font-medium text-foreground">Order Summary</h3>
                        <dl className="mt-4 space-y-6">
                            {cartItems.map((item) => (
                                <div key={`${item.product.id}-${item.selectedSize || 'default'}`} className="flex items-center justify-between">
                                    <dt className="text-sm text-muted-foreground">
                                        {item.product.name} (x{item.quantity})
                                        {item.selectedSize && <span className="ml-2 font-medium text-primary">Size: {item.selectedSize}</span>}
                                    </dt>
                                    <dd className="text-sm font-medium text-foreground">₹{(item.price * item.quantity).toFixed(2)}</dd>
                                </div>
                            ))}
                            <div className="flex items-center justify-between border-t border-border pt-6">
                                <dt className="text-base font-medium text-foreground">Total</dt>
                                <dd className="text-base font-medium text-foreground">₹{cartTotal.toFixed(2)}</dd>
                            </div>
                        </dl>
                    </div>

                    <div className="mt-10 flex justify-between">
                        <button
                            onClick={() => setStep(1)}
                            className="text-indigo-600 hover:text-indigo-500 font-medium"
                        >
                            Back to Address
                        </button>
                        <button
                            onClick={handlePlaceOrder}
                            className="bg-primary border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-primary-foreground hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                            Place Order
                        </button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="mt-12 text-center">
                    <svg className="mx-auto h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <h2 className="mt-4 text-lg font-medium text-foreground">Order placed successfully!</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Thank you for your purchase. We have received your order.
                    </p>
                    <div className="mt-6">
                        <button
                            onClick={() => router.push('/')}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-primary-foreground bg-primary hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                            Continue Shopping
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
