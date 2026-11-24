// Test reports for the sealing test (sealing-test.html). Every person, place, number and result is invented.
// {{TYPE:text}} marks an identifier that must be hidden. A line that starts with "> " holds a result that must be kept.
// "practice": 50 reports used while improving the rules (30 by the developer, 20 by Gemini).
// "unseen": 20 reports written by Gemini (gemini-3.5-flash-lite) after the rules were frozen. Missing marks were added and
// names of real organisations replaced by hand. The rules were not changed to suit them, so this is the honest score.
export const CASES = [
// ---------------------------------------------------------------- practice
{ set: "practice", kind: "Lab report, printed table", text: `{{FACILITY:SRI VENKATA DIAGNOSTICS}}
{{ADDRESS:Plot 44, Kalyan Nagar, Vijayawada 520010}}
Patient Name : {{NAME:Mr. Harish Babu Gollapudi}}     Age : 47 Years   Sex : Male
UHID : {{ID:SVD/88213/25}}    Lab No : {{ID:250098771}}
Referred By : {{DOCTOR:Dr. Suma Kolluri}}
Collected On : 12/08/2026
> Haemoglobin 14.1 g/dL 13.0 - 17.0
> Total WBC Count 9,800 /cumm 4,000 - 11,000
> Platelet Count 2.1 lakh/cumm 1.5 - 4.5
> Fasting Blood Glucose 132 mg/dL 70 - 100
{{DOCTOR:Dr. Nikhil Varma}}, MD Pathology` },
{ set: "practice", kind: "Lab report, capitals", text: `{{FACILITY:MERIDIAN CLINICAL LABORATORY}}
NAME: {{NAME:KAVERI SUBRAMANIAM}}   AGE/SEX: 36/F
REG NO: {{ID:MCL-2026-5512}}
REF BY: {{DOCTOR:DR. P. ANANTHAN}}
PH: {{CONTACT:044-2811 7766}}
> TSH 8.4 uIU/mL 0.4 - 4.0
> FREE T4 0.9 ng/dL 0.8 - 1.8
> FREE T3 2.6 pg/mL 2.0 - 4.4` },
{ set: "practice", kind: "Pasted text, no labels", text: `{{NAME:Rohini Deshpande}}
42 yrs female
{{CONTACT:+91 99234 55671}}
{{CONTACT:rohini.d@example.org}}
> Serum Creatinine 1.4 mg/dL 0.6 - 1.1
> Blood Urea 46 mg/dL 15 - 40
> Uric Acid 7.2 mg/dL 2.6 - 6.0` },
{ set: "practice", kind: "Message from the lab", text: `Dear {{NAME:Farhan Qureshi}}, your reports from {{FACILITY:Apex Care Labs}} are ready.
Bill No {{ID:AC-99120}}.
> HbA1c 7.9 % < 5.7
> Post Prandial Glucose 212 mg/dL < 140
For queries call {{CONTACT:98111 20345}}. Please show this to {{DOCTOR:Dr Iyengar}}.` },
{ set: "practice", kind: "Relative named", text: `Patient's Name: {{NAME:Baby Aarohi Kulkarni}}
D/o: {{NAME:Mr. Sandeep Kulkarni}}
DOB: {{DOB:03-11-2024}}
Address: {{ADDRESS:B-12, Tulip Heights, Baner, Pune 411045}}
> Bilirubin Total 11.2 mg/dL 1.0 - 12.0
> Bilirubin Direct 0.4 mg/dL < 0.5` },
{ set: "practice", kind: "Aadhaar and health id", text: `Name: {{NAME:Devaraj Muthuswamy}}   Age: 63   Gender: Male
Aadhaar No: {{ID:5521 8890 4432}}
ABHA No: {{ID:91-2204-5561-7788}}
PAN: {{ID:BKLPM4471R}}
> Total Cholesterol 244 mg/dL < 200
> HDL Cholesterol 36 mg/dL > 40
> Triglycerides 301 mg/dL < 150` },
{ set: "practice", kind: "Photo text, broken lines", text: `{{FACILITY:Nandini Pathology Centre}}
Near {{ADDRESS:Old Bus Stand}}
Name
{{NAME:Shanthi Prakash}}
Age 58 Yrs
Ref Dr
{{DOCTOR:Dr. Ganesh Hegde}}
> Vitamin B12 148 pg/mL 200 - 900
> Vitamin D (25-OH) 11 ng/mL 30 - 100` },
{ set: "practice", kind: "Prescription", text: `{{DOCTOR:Dr. Leela Mathews}} MBBS, MD
Reg. No: {{ID:KMC-45120}}
{{FACILITY:Green Leaf Clinic}}, {{ADDRESS:Residency Road, Bengaluru 560025}}
Patient: {{NAME:Thomas Kuruvila}}   51/M
> Tab Metformin 500 mg twice daily after food
> Tab Atorvastatin 10 mg at night
Review after 3 months with HbA1c` },
{ set: "practice", kind: "Remarks with names", text: `Patient Name: {{NAME:Mrs. Gurpreet Kaur Sidhu}}    Age: 49 Years
Lab ID: {{ID:PB77102}}
> Ferritin 8 ng/mL 10 - 120
> Haemoglobin 9.1 g/dL 12.0 - 15.0
Remarks: {{NAME:Gurpreet}} feels tired. Discussed with her husband {{NAME:Harjit}} on phone.` },
{ set: "practice", kind: "Hospital lab slip", text: `{{FACILITY:JEEVAN MULTISPECIALITY HOSPITAL}}
MRN: {{ID:JMH0099812}}  IP No: {{ID:IP/26/4410}}  Ward: 3B
Patient Name: {{NAME:Abdul Rasheed}}  Age/Sex: 70Y/M
Consultant: {{DOCTOR:Dr. Vivek Bhandari}}
> Sodium 128 mmol/L 135 - 145
> Potassium 5.8 mmol/L 3.5 - 5.1
> Serum Creatinine 3.2 mg/dL 0.7 - 1.3` },
{ set: "practice", kind: "Health check package", text: `Booking ID: {{ID:HC-7781203}}
Customer: {{NAME:Nithya Raghavan}}
Mobile: {{CONTACT:9845098450}}
Email: {{CONTACT:nithya_r@example.com}}
Employer: {{FACILITY:Bluewave Software}}
> SGPT (ALT) 64 U/L < 35
> SGOT (AST) 41 U/L < 35
> Alkaline Phosphatase 88 U/L 30 - 120` },
{ set: "practice", kind: "Urine report", text: `{{FACILITY:Sahyadri Scans & Labs}}
Name- {{NAME:Meenakshi Bai}}   Age- 66   F
Ref by- {{DOCTOR:Dr Rao}}
Sample Type: Urine
> Pus Cells 12 /hpf 0 - 5
> Specific Gravity 1.020 1.005 - 1.030
> pH 6.0 5.0 - 8.0` },
{ set: "practice", kind: "Two patients, forwarded", text: `Forwarded: {{NAME:Anil Saxena}} 9/3
Amma's report, name {{NAME:Pushpa Saxena}}, {{FACILITY:Lifeline Diagnostics}} {{ADDRESS:Gomti Nagar}}
> Fasting Blood Glucose 161 mg/dL 70 - 100
> HbA1c 8.1 % < 5.7` },
{ set: "practice", kind: "Policy and employee numbers", text: `Name: {{NAME:Prakash Rathod}}
Employee ID: {{ID:EMP44871}}
Policy No: {{ID:HLT/2026/00981}}
> Haemoglobin 15.2 g/dL 13.0 - 17.0
> ESR 22 mm/hr 0 - 15` },
{ set: "practice", kind: "Signature block", text: `Name of Patient: {{NAME:Lalitha Krishnamurthy}}  Age: 55
> LDL Cholesterol 162 mg/dL < 100
> VLDL 38 mg/dL 5 - 40
Verified by: {{DOCTOR:Sneha Pillai}}, Lab Technician
Authorised signatory
{{DOCTOR:Dr. Manoj Tiwari}} DCP` },
{ set: "practice", kind: "Lab report, printed table", text: `{{FACILITY:PRAGATI DIAGNOSTIC CENTRE}}
{{ADDRESS:3rd Floor, Lotus Arcade, M G Road, Kochi 682016}}
Patient Name: {{NAME:Ms. Anju Varghese}}    Age: 29 Years    Sex: Female
Patient ID: {{ID:PDC556120}}     Sample No: {{ID:S-77129}}
Ref. Doctor: {{DOCTOR:Dr. Roy Chacko}}
Reported On: 02/09/2026
> Haemoglobin 10.4 g/dL 12.0 - 15.0
> MCV 71 fL 80 - 100
> Platelet Count 3.9 lakh/cumm 1.5 - 4.5
> Serum Iron 31 ug/dL 50 - 170
Checked by {{DOCTOR:Dr. Beena Joseph}} MD` },
{ set: "practice", kind: "Lab report, capitals", text: `{{FACILITY:OMKAR PATHOLOGY}}
PATIENT: {{NAME:VINAYAK JOSHI}}      AGE: 61     SEX: M
ACCESSION NO: {{ID:OP26-33871}}
REFERRED BY: {{DOCTOR:DR S K PHADKE}}
CONTACT: {{CONTACT:+91-98220-71234}}
> PSA 6.1 ng/mL < 4.0
> CREATININE 1.1 mg/dL 0.7 - 1.3` },
{ set: "practice", kind: "Pasted text, no labels", text: `{{NAME:Imran Sheikh}}, 38 M
{{ADDRESS:14 Mosque Street, Seelampur, Delhi 110053}}
{{CONTACT:8800114477}}
> Uric Acid 9.0 mg/dL 3.5 - 7.2
> Triglycerides 388 mg/dL < 150` },
{ set: "practice", kind: "Message from the lab", text: `Hello {{NAME:Sumathi}} madam,
Your blood test at {{FACILITY:Medisure Lab}} on 4 Oct is done. Ref {{ID:MS/10/4456}}
> TSH 0.1 uIU/mL 0.4 - 4.0
> Free T4 2.4 ng/dL 0.8 - 1.8
Regards, {{NAME:Karthik}}, front desk {{CONTACT:080 4567 8899}}` },
{ set: "practice", kind: "Relative named", text: `Name : {{NAME:Master Ishaan Mehta}}   Age : 7 Yrs
Father Name : {{NAME:Nirav Mehta}}
Mother : {{NAME:Hetal Mehta}}
Date of Birth : {{DOB:21/06/2019}}
> Haemoglobin 11.0 g/dL 11.5 - 15.5
> Absolute Eosinophil Count 910 /cumm 20 - 500` },
{ set: "practice", kind: "Aadhaar and passport", text: `Patient Name: {{NAME:Chandrika Nambiar}}  F/44
Aadhaar: {{ID:774488112290}}
Passport No: {{ID:T4471982}}
Ph No. {{CONTACT:9447012389}}
> HBsAg Non Reactive
> Haemoglobin 12.6 g/dL 12.0 - 15.0` },
{ set: "practice", kind: "Photo text, broken lines", text: `{{FACILITY:SWASTHYA LABS}}
Pt Name
{{NAME:Ramanathan V}}
Age/Sex
72 / M
Dr
{{DOCTOR:Uma Maheshwari}}
> Blood Urea 88 mg/dL 15 - 40
> Serum Creatinine 2.9 mg/dL 0.7 - 1.3
> Potassium 5.6 mmol/L 3.5 - 5.1` },
{ set: "practice", kind: "Prescription", text: `{{FACILITY:Amrita Family Clinic}}
{{DOCTOR:Dr. Joyeeta Sen}}, MD (Medicine)
{{ADDRESS:22/1 Lake View Road, Kolkata 700029}}
Mrs {{NAME:Tapasi Ghosh}}, 59 yrs
> Tab Telmisartan 40 mg once daily
> Tab Levothyroxine 50 mcg before breakfast
Next visit 6 weeks` },
{ set: "practice", kind: "Remarks with names", text: `Patient Name: {{NAME:Joseph D'Souza}}     Age: 67 Years
UHID: {{ID:GA/441/90}}
> HbA1c 9.4 % < 5.7
> Urine Microalbumin 96 mg/L < 20
Note: {{NAME:Joseph}} lives with his daughter {{NAME:Maria}}, who manages his insulin. Informed {{DOCTOR:Dr. Fernandes}}.` },
{ set: "practice", kind: "Hospital lab slip", text: `{{FACILITY:Shanti Memorial Hospital}}, {{ADDRESS:Civil Lines, Nagpur}}
OP No: {{ID:OP-118823}}
Name: {{NAME:Savita Wankhede}}    45 Y / F
Doctor: {{DOCTOR:Dr. Amol Deshmukh}}
Bed: 12
> D-Dimer 1.8 ug/mL < 0.5
> CRP 64 mg/L < 5
> Platelet Count 0.9 lakh/cumm 1.5 - 4.5` },
{ set: "practice", kind: "Health check package", text: `Order #{{ID:5510098123}}
Booked for: {{NAME:Siddharth Jain}}
Collected at: {{ADDRESS:Flat 9C, Pearl Enclave, Vastrapur, Ahmedabad}}
Phlebotomist: {{NAME:Mukesh}}
> Vitamin D (25-OH) 18 ng/mL 30 - 100
> Vitamin B12 190 pg/mL 200 - 900
> Total Cholesterol 182 mg/dL < 200` },
{ set: "practice", kind: "Short code report", text: `{{FACILITY:City Care Polyclinic}}
{{NAME:Zainab Bi}} / 33 / F / {{ID:CC-2231}}
Ref: {{DOCTOR:Dr. Nazneen}}
> Beta HCG 2410 mIU/mL < 5
> Progesterone 18.2 ng/mL 11 - 44` },
{ set: "practice", kind: "Hindi name line", text: `{{FACILITY:आरोग्य पैथोलॉजी}}
रोगी का नाम: {{NAME:सुनीता देवी}}
Age: 50   Sex: F
Mobile {{CONTACT:7007123498}}
> Fasting Blood Glucose 109 mg/dL 70 - 100
> Haemoglobin 11.8 g/dL 12.0 - 15.0` },
{ set: "practice", kind: "Policy and employee numbers", text: `Emp Code: {{ID:TX-90871}}
Insured: {{NAME:Bhavana Shetty}}
Card No: {{ID:8890 1123 7765 0012}}
TPA: {{FACILITY:Suraksha Assist}}
> SGPT (ALT) 29 U/L < 35
> GGT 55 U/L < 40` },
{ set: "practice", kind: "Signature block", text: `Name: {{NAME:Rukmini Achar}}   Age: 74   Sex: F
> Sodium 131 mmol/L 135 - 145
> Calcium 8.1 mg/dL 8.5 - 10.5
Technician: {{NAME:Preeti Solanki}}
Reported by {{DOCTOR:Dr. Uday Bhat}}, Consultant Biochemist
{{FACILITY:Coastal Diagnostics}} {{ADDRESS:Hampankatta, Mangaluru 575001}}` },
// ---------------------------------------------------------------- practice, written by Gemini
{ set: "practice", kind: "Printed lab report", text: `{{FACILITY:Apex Health Diagnostics}}
{{ADDRESS:14 MG Road, Bengaluru}}
Patient: {{NAME:Rohan Verma}} | Age: 42 | Sex: Male
Ref By: {{DOCTOR:Dr. S. K. Nair}}
Lab Ref: {{ID:APEX-99821}}
----------------------------------------
Test Name | Result | Units | Ref Range
> Fasting Blood Sugar | 126 | mg/dL | 70-100
> Serum Creatinine | 1.4 | mg/dL | 0.6-1.2
----------------------------------------
Approved by {{DOCTOR:Dr. Meera Menon}}` },
{ set: "practice", kind: "Lab report in capitals", text: `{{FACILITY:SHANTI PATHOLOGY LAB}}
{{ADDRESS:PLOT 4, CIVIL LINES, JAIPUR}}
PATIENT: {{NAME:GEETA SHARMA}} AGE: 58 FEMALE
REGISTERED: {{ID:SPL/2023/8834}}
DOCTOR: {{DOCTOR:DR. V. P. MATHUR}}
----------------------------------------
> HEMOGLOBIN | 10.2 | G/DL | 12.0-15.5
> TOTAL LEUCOCYTE COUNT | 11000 | CUBIC MM | 4000-11000
----------------------------------------
VERIFIED BY {{DOCTOR:DR. ANJU GUPTA}}` },
{ set: "practice", kind: "SMS from a lab", text: `Dear {{NAME:Mohammed Al-Farsi}},
Your sample with ID {{ID:LIMS-77291}} has been processed by {{FACILITY:Crescent Diagnostics}}.
Contact: {{CONTACT:support@crescentlab.in}} or call {{CONTACT:+91-9844123456}}.
> Serum Cholesterol | 215 | mg/dL | <200
> Triglycerides | 180 | mg/dL | <150
Thank you for choosing {{FACILITY:Crescent Diagnostics}}.` },
{ set: "practice", kind: "Photo text", text: `HOSPITAL: {{FACILITY:Sri Balaji Medical Ctr}}
PATIENT: {{NAME:Lakshmi Narayanan}}
UHID: {{ID:BLJ-004921}} LOC: {{ADDRESS:Madurai}}
ATTENDING: {{DOCTOR:Dr. K. R. Raman}}

> Serum Bilirubin Total | 1.9 | mg/dL | 0.2-1.2
> SGOT (AST) | 54 | U/L | 10-40

Verified at {{FACILITY:Sri Balaji Medical Ctr}} labs.` },
{ set: "practice", kind: "In-patient lab slip", text: `{{FACILITY:Holy Cross General Hospital}}
{{ADDRESS:Mission Ward, Kochi}}
In-Patient Lab Slip
Patient: {{NAME:Thomas Kuruvila}} | IP No: {{ID:IP-44120}}
Consultant: {{DOCTOR:Dr. Priya Joseph}}
----------------------------------------
> Serum Potassium | 5.2 | mmol/L | 3.5-5.0
> Blood Urea Nitrogen | 38 | mg/dL | 7-20
----------------------------------------
Sample collected by {{DOCTOR:Nurse Mary}}` },
{ set: "practice", kind: "Prescription", text: `{{FACILITY:Sri Balaji Clinic}}, {{ADDRESS:45 Temple Road, Madurai}}
{{DOCTOR:Dr. Ramesh Kumar}}, Reg No: {{ID:44219}}
Patient: {{NAME:Sunita Sharma}}, Age: 34, Sex: F
Date: 12/04/2024
Diagnosis: Acute Bronchitis
> Tab Azithromycin 500mg once daily for 5 days
> Syr Terbutaline 10ml thrice daily
Advice: Steam inhalation twice a day
Follow up after 4 days
Signature: {{DOCTOR:R. Kumar}}` },
{ set: "practice", kind: "Child's report", text: `{{FACILITY:Apex Diagnostic Centre}}, {{ADDRESS:Sector 18, Noida}}
Patient Name: {{NAME:Master Aarav Verma}}
Parent/Guardian: Father: {{NAME:Rajesh Verma}}
Ref By: {{DOCTOR:Dr. Neha Gupta}}
Sample ID: {{ID:LAB-993821}}
> Hemoglobin: 11.2 gm/dl
> Total Leucocyte Count: 8500 cells/cumm
> Platelet Count: 2.5 lakh/cumm
Sample collected on 15th May 2024
Verified by: {{DOCTOR:Dr. K. Sen}}` },
{ set: "practice", kind: "Plain text", text: `{{FACILITY:Pathbright Labs}} report for {{NAME:Mohammed Al-Farsi}}, {{CONTACT:mohammed.f@email.com}}, {{CONTACT:+919876543210}}.
Patient visited {{FACILITY:City Health Hub}}, {{ADDRESS:MG Road, Bangalore}} on 02/03/2024.
Bill Number: {{ID:BL-55410}}.
Consultant: {{DOCTOR:Dr. Priya Nair}}.
> Serum Creatinine: 0.9 mg/dl
> Blood Urea Nitrogen: 18 mg/dl
> Fasting Blood Glucose: 92 mg/dl
All values are within normal limits.
Please consult your physician.` },
{ set: "practice", kind: "WhatsApp message", text: `Hey {{NAME:Bikash}}, I got the test results for {{NAME:Moumita Das}} from {{FACILITY:Swastik Nursing Home}}, {{ADDRESS:12 Park Street, Kolkata}}.
{{DOCTOR:Dr. Subir Sen}} checked it.
Registration ID: {{ID:WB-88214}}.
Here are the main values:
> Serum Cholesterol: 195 mg/dl
> Triglycerides: 140 mg/dl
Doctor says it is fine, just need to avoid sweets.
Call me when free.` },
{ set: "practice", kind: "Health check package", text: `{{FACILITY:Wellness Sarovar Diagnostics}}, {{ADDRESS:3rd Floor, Falcon Mall, Pune}}
Corporate Health Package Report
Customer Name: {{NAME:Deepika Iyer}}
Employee ID: {{ID:EMP-7732}}, DOB: {{DOB:14/08/1988}}
Email: {{CONTACT:deepika.iyer@corp.net}}, Phone: {{CONTACT:+918765432109}}
Authorized By: {{DOCTOR:Dr. Anil Joshi}}
> Total Cholesterol: 210 mg/dl
> HDL Cholesterol: 45 mg/dl
> LDL Cholesterol: 135 mg/dl
> HbA1c: 5.8%
Overall Risk Assessment: Borderline` },
{ set: "practice", kind: "Insurance medical test", text: `{{FACILITY:Apex Health Screening Center}}, {{ADDRESS:Sector 62, Noida}}
Client: {{NAME:Rajesh Kumar}}, Ref: {{ID:POL-9948210}}
Company: {{FACILITY:Zenith Life Insurance Ltd}}
Contact: {{CONTACT:rajesh.k@email.com}}
Attending Physician: {{DOCTOR:Dr. Sunita Sharma}}
> Fasting Blood Glucose: 112 mg/dL
> Total Serum Cholesterol: 210 mg/dL
> Serum Creatinine: 1.1 mg/dL
> Urine Routine Microscopy: Trace proteins
Remarks: Advised lifestyle modification and follow up.` },
{ set: "practice", kind: "Remarks naming relatives", text: `{{FACILITY:Metro Diagnostics}}, {{ADDRESS:MG Road, Kochi}}
Patient Name: {{NAME:Fatima Beevi}}, File No: {{ID:PAT-44029}}
Referred By: {{DOCTOR:Dr. Manoj Menon}}
Family History noted from spouse {{NAME:Ibrahim Kutty}}
Patient's sister {{NAME:Aisha Mol}} accompanied during visit.
> Hemoglobin: 10.2 g/dL
> Total Leucocyte Count: 8500 /cumm
> Erythrocyte Sedimentation Rate: 35 mm/hr
Clinical note: Patient advised consultation with {{DOCTOR:Dr. Zachariah}} regarding persistent fatigue.` },
{ set: "practice", kind: "Several signatures", text: `{{FACILITY:Sri Balaji Multi-Speciality Hospital}}, {{ADDRESS:Anna Salai, Chennai}}
Patient: {{NAME:Karthik Sundaram}}, UHID: {{ID:MDS-88392}}
Consultant: {{DOCTOR:Dr. R. Natarajan}}
Lab Director: {{DOCTOR:Dr. K. Swaminathan}}
> Serum Bilirubin Total: 0.9 mg/dL
> Serum SGOT / AST: 28 U/L
> Serum SGPT / ALT: 32 U/L
> Alkaline Phosphatase: 90 IU/L
Verified by Biochemist: {{DOCTOR:V. Murugan}}
Pathologist Signature: {{DOCTOR:Dr. S. Anand}}
Chief Medical Officer: {{DOCTOR:Dr. Priya Ramesh}}` },
{ set: "practice", kind: "Small-town lab", text: `{{FACILITY:Janata Clinical Laboratory}}, {{ADDRESS:Main Bazaar, Ballia, Uttar Pradesh}}
Patient: {{NAME:Munni Devi}}, DOB: {{DOB:14-06-1980}}
Lab Incharge: {{DOCTOR:Dr. B. P. Srivastava}}
Contact No: {{CONTACT:+91-9838271100}}
Registration ID: {{ID:JCL-2023-551}}
> Serum T3: 1.1 ng/mL
> Serum T4: 7.2 mcg/dL
> Thyroid Stimulating Hormone TSH: 6.8 uIU/mL
Sample collected by technician {{DOCTOR:Ramlal}}
Report delivered to {{NAME:Suresh Prasad}}.` },
{ set: "practice", kind: "Government id numbers", text: `{{FACILITY:Pulse Care Diagnostics}}, {{ADDRESS:FC Road, Pune}}
Patient Name: {{NAME:Amitabh Deshmukh}}
Aadhaar No: {{ID:4412-8890-3321}}
PAN Card: {{ID:ABCDE1234F}}
Health ID (ABHA): {{ID:22-9901-4432-1188}}
Referring Doctor: {{DOCTOR:Dr. Smita Kulkarni}}
> Fasting Plasma Glucose: 98 mg/dL
> Post Prandial Plasma Glucose: 140 mg/dL
> Glycated Hemoglobin HbA1c: 6.1 %
Verified against government records at {{FACILITY:Pune East Health Wing}}.` },
{ set: "practice", kind: "Diabetes follow-up", text: `{{FACILITY:Metro Endocrinology Clinic}}, {{ADDRESS:45, Park Circus, Kolkata}}
Patient: {{NAME:Soumitra Bagchi}} | UHID: {{ID:CR-998231}}
Referred by: {{DOCTOR:Dr. Ananya Mukherjee}}
Clinical Notes: Patient reports mild fatigue. Diet control is moderate.
> Fasting Blood Sugar: 142 mg/dL (Ref: 70-100)
> HbA1c: 7.8% (Ref: < 5.7)
Prescribed Medication: Tab. Metformin 500mg twice daily
Advice: Increase physical activity and follow-up in 3 months.
Attending Consultant: {{DOCTOR:Dr. Subhash Roy}}` },
{ set: "practice", kind: "Kidney function report", text: `{{FACILITY:Sri Venkateswara Medical Institute}}, {{ADDRESS:Road No. 12, Banjara Hills, Hyderabad}}
Patient Name: {{NAME:Lakshmi Narasimhan}}
Reg ID: {{ID:HOSP-774421}} | Ward: Nephrology OPD
Physician in Charge: {{DOCTOR:Dr. K. Venugopal}}
Sample Source: Venous Blood
> Serum Creatinine: 1.8 mg/dL (Ref: 0.6-1.2)
> Blood Urea Nitrogen (BUN): 28 mg/dL (Ref: 7-20)
> Estimated GFR: 42 mL/min/1.73m2
Clinical Remark: Moderate renal impairment noted.
Verified by Biochemist: {{DOCTOR:Dr. Meenakshi Sundaram}}` },
{ set: "practice", kind: "Home collection", text: `{{FACILITY:Apex Diagnostic Services}}
Sample Collected From: {{ADDRESS:Flat 302, Palm Grove Apartments, MG Road, Pune}}
Client: {{NAME:Zoya Khan}} | Booking Ref: {{ID:HOM-883392}}
Phlebotomist: {{DOCTOR:Dr. Rajesh Kadam}}
Tests Requested: Lipid Profile
> Total Cholesterol: 235 mg/dL (Desirable: < 200)
> Triglycerides: 190 mg/dL (Normal: < 150)
> HDL Cholesterol: 38 mg/dL (Low: < 40)
Sample processed at central lab.
For queries contact: {{CONTACT:support@apexdiag.co.in}}` },
{ set: "practice", kind: "Email from a clinic", text: `From: {{CONTACT:reports@lotushealthclinic.in}}
To: {{NAME:Gurpreet Singh}} <{{CONTACT:gurpreet.s@mailprovider.com}}>
Subject: Pathology Test Results - {{ID:PAT-556102}}
Dear {{NAME:Gurpreet Singh}},
Your routine blood investigations are now available from {{FACILITY:Lotus Health Clinic}}, {{ADDRESS:Sector 17, Chandigarh}}.
> Hemoglobin: 13.5 g/dL (Ref: 13.0-17.0)
> Total Leukocyte Count: 7,800 cells/uL (Ref: 4,000-11,000)
Consulting Physician: {{DOCTOR:Dr. Harpreet Kaur}}
Please book an appointment to discuss these findings.` },
{ set: "practice", kind: "Discharge summary", text: `{{FACILITY:Holy Grove Hospital}}, {{ADDRESS:Okhla Road, New Delhi}}
Patient: {{NAME:Anand Kumar Sharma}} | IPD No: {{ID:IP-441299}}
Discharged under the care of {{DOCTOR:Dr. R. C. Mehra}}
Course in Hospital: Patient treated for acute gastroenteritis and recovered well.
Condition at discharge: Stable and afebrile.
> Serum Sodium: 136 mEq/L (Ref: 135-145)
> Serum Potassium: 4.1 mEq/L (Ref: 3.5-5.0)
Discharge Medications: ORS packets and soft diet advised.
Emergency Contact: {{CONTACT:011-29938811}}` },
// ---------------------------------------------------------------- unseen (written by Gemini)
{ set: "unseen", kind: "Cardiology summary", text: `{{FACILITY:CardioNest Health Hub}}, {{ADDRESS:Plot 42, Ring Road, Nagpur 440015}}
Patient: {{NAME:Zoya Fernandez}} | Ref By: {{DOCTOR:Dr. K. Natarajan}}
Sample ID: {{ID:CC-98234-X}} | Contact: {{CONTACT:zoya.f@xmail.net}}
Registration No: {{ID:REG-2023-7711}}
----------------------------------------
> Serum Cholesterol: 245 mg/dL (Desired: < 200)
> Triglycerides: 180 mg/dL (Normal: < 150)
> HDL Cholesterol: 38 mg/dL (Low: > 40)
Remarks: Borderline dyslipidemia observed, suggest dietary modification.
Authorised Signatory: {{DOCTOR:Dr. M. Sen}}` },
{ set: "unseen", kind: "Blood camp report", text: `{{FACILITY:Jeevan Jyoti Blood & Health Camp}}, {{ADDRESS:St. Xavier Ground, Patna 800001}}
Organized by {{FACILITY:Prayaas Charitable Trust}}
Camp ID: {{ID:CAMP-PAT-88}}
Tested For: {{NAME:Gurpreet Bhullar}} | DOB: {{DOB:14/06/1992}}
Donor Reg: {{ID:BB-PAT-4401}}
----------------------------------------
> Haemoglobin Level: 10.2 g/dL (Normal: 12.0 - 15.5)
> Blood Group: B Positive
> Rhesus Factor: Reactive
Advice: Iron supplementation recommended for mild anaemia.
Camp Medical Officer: {{DOCTOR:Dr. Alok Bannerjee}}` },
{ set: "unseen", kind: "Eye hospital pre-surgery report", text: `{{FACILITY:Nethralaya Eye Care Centre}}, {{ADDRESS:12 Marina Beach Road, Chennai 600004}}
Patient Name: {{NAME:Meenakshi Sundaram}} | File Ref: {{ID:NE-PRE-551}}
Surgeon: {{DOCTOR:Dr. V. R. Swaminathan}}
Patient ID: {{ID:PT-998823}}
----------------------------------------
> Fasting Blood Glucose: 92 mg/dL (Ref: 70 - 100)
> Bleeding Time (BT): 2 min 30 sec (Ref: 2 - 7 min)
> Clotting Time (CT): 5 min 10 sec (Ref: 4 - 10 min)
Clearance: Fit for planned ophthalmic procedure under local anaesthesia.
Pathologist: {{DOCTOR:Dr. Preeti Deshmukh}}` },
{ set: "unseen", kind: "Small lab with spelling mistakes", text: `{{FACILITY:Shree Diagnostik Centre}}, {{ADDRESS:Main Bazar, Near Bus Stand, Jhansi 284002}}
Patient: {{NAME:Thirumavalavan K.}}
Bill No: {{ID:INV-412}}
Mobile: {{CONTACT:9876543210}}
Referred by: {{DOCTOR:Dr. B. L. Verma}}
----------------------------------------
> Totaol Leukocyte Count: 11,200 cells/cmm (Normal: 4000-11000)
> Erythrocytes Sedimentation Rate: 28 mm/hr (Normal: 0-20)
> Urin Sugar: Trace
Note: Specimen reseived in slightly haemolysed condition.
Tested By: {{DOCTOR:Lab Tech Ramesh}}` },
{ set: "unseen", kind: "Antenatal report", text: `Antenatal Care Unit, {{FACILITY:Zaitoon Polyclinic}}, {{ADDRESS:Mehdipatnam, Hyderabad}}
Patient: {{NAME:Zoya Farooq}}, Husband: {{NAME:Irfan Farooq}}, ID: {{ID:ZPC-88492}}
Referred by: {{DOCTOR:Dr. Meenakshi Iyer}}
> Hemoglobin: 11.4 g/dL (Normal: 12.0-15.5)
> Blood Group & Rh: B Positive
> VDRL Test: Non-Reactive
> Fasting Blood Sugar: 88 mg/dL
Report generated by {{DOCTOR:Dr. K. V. Rao}}` },
{ set: "unseen", kind: "Corporate health check", text: `{{FACILITY:Vishwa Wellness Solutions}}, {{ADDRESS:Sector V, Salt Lake, Kolkata}}
Employee Name: {{NAME:Subir Mukherjee}}, Emp ID: {{ID:VWS-3091}}
Department: Logistics, Age: 34, Sex: Male
> Total Cholesterol: 190 mg/dL
> SGPT (ALT): 35 U/L
> Serum Creatinine: 0.9 mg/dL
> Chest X-Ray: Clear lung fields, no active lesions
Medical Officer: {{DOCTOR:Dr. Paromita Sengupta}}` },
{ set: "unseen", kind: "School health camp", text: `{{FACILITY:St. Jude's Vidyaniketan}}, {{ADDRESS:Kottayam District, Kerala}}
Student: {{NAME:Tenzin Norbu}}, Guardian: {{NAME:Pema Norbu}}, Class: 4-B
> Vision: Right 6/6, Left 6/9
> Dental Examination: Mild plaque accumulation noted
> Height: 128 cm, Weight: 26 kg
Camp Physician: {{DOCTOR:Dr. Roy Kurien}}` },
{ set: "unseen", kind: "Mixed label style", text: `{{FACILITY:Apex Bio-Diagnostics}} / {{ADDRESS:FC Road, Pune}}
Patient - {{NAME:Bhagyashree Jadhav}} | Lab ID - {{ID:ABD-7721}}
Consultant: {{DOCTOR:Dr. Smita Deshmukh}}
> Serum TSH - 4.2 uIU/mL
> Serum Free T4 - 1.1 ng/dL
> Serum Vitamin D - 18 ng/mL (Deficient)
Verified by {{DOCTOR:Dr. Anand Joshi}}` },
{ set: "unseen", kind: "Text message", text: `From: {{CONTACT:+91-9842109823}}
To: {{CONTACT:support@swasthya-help.org}}
Message regarding {{NAME:Zoya Mirza}}'s health status at {{ADDRESS:Flat 4B, Lotus Apartments, Mysore}}.
> Total White Blood Count is 8200 per microliter.
> Fasting blood glucose level is 94 milligrams per deciliter.
Please update the portal for patient id {{ID:WZ-99281}} registered under guardian {{NAME:Farhan Mirza}}.` },
{ set: "unseen", kind: "Liver function report", text: `{{FACILITY:Sri Ranganatha District General Hospital}}
Ward: Gastroenterology, {{ADDRESS:Ring Road, Warangal}}
Patient: {{NAME:Thirumalai Chettiar}}
UHID: {{ID:AP-7734-2024}}
Attending physician: {{DOCTOR:Dr. K. S. Mukherjee}}
> Serum Total Bilirubin: 0.9 mg/dL
> Alanine Aminotransferase (ALT): 34 IU/L
Approved by senior pathologist {{DOCTOR:Dr. Meenakshi Sundaram}} at {{FACILITY:Central Diagnostics Unit}}` },
{ set: "unseen", kind: "Vitamin and iron report", text: `Lab Ref: {{ID:PATH-883921}}
Collection Centre: {{FACILITY:Pragati Health Hub}}, {{ADDRESS:Civil Lines, Raipur}}
Referred by: {{DOCTOR:Dr. Alok Bannerjee}}
Patient Name: {{NAME:Lalremruati Sailo}}
Client Contact: {{CONTACT:lalrem.s@email.net}}
> Serum Ferritin: 45 ng/mL
> Vitamin D Total: 22 ng/mL
Verified by lab technician {{DOCTOR:Dr. V. Namboodiri}}` },
{ set: "unseen", kind: "Prescription", text: `{{FACILITY:Arogya Niketan Clinic}}, {{ADDRESS:Station Road, Siliguri}}
Patient: {{NAME:Gurpreet Dhillon}}
Patient Mobile: {{CONTACT:+91-7701234890}}
Consultation ID: {{ID:RX-55412}}
Consulting Physician: {{DOCTOR:Dr. Sneha Ganguly}}
> Tab. Paracetamol 500mg - 1 tablet thrice daily after food for 3 days
> Cap. Amoxicillin 250mg - 1 capsule every 8 hours for 5 days
Signature: {{DOCTOR:Dr. Sneha Ganguly}}` },
{ set: "unseen", kind: "Insurance pre-policy report", text: `{{FACILITY:Zenith Life Assurance}} Assessment Centre
Client Name: {{NAME:Zoya Farooqui}}
Policy App No: {{ID:ZLA-883921-2023}}
DOB: {{DOB:14-06-1981}} | Gender: Female
Address: {{ADDRESS:44 Silk Mill Lane, Kozhikode}}
Contact: {{CONTACT:+91-98421-99881}}
Examiner: {{DOCTOR:Dr. M. K. Pillai}}
> Fasting Blood Sugar: 94 mg/dL
> Total Serum Cholesterol: 182 mg/dL
> Resting ECG: Normal Sinus Rhythm
Remarks: Clear for standard tier issuance.` },
{ set: "unseen", kind: "Urine culture", text: `{{FACILITY:Arogya Diagnostic & Path Lab}}
Patient: {{NAME:Birendra Nongthombam}}
Ward: Surgical ICU | Bed No: SICU-14
Hospital ID: {{ID:HOS-990214}}
Attending Physician: {{DOCTOR:Dr. Vanlal Ruati}}
Sample Collected by: {{DOCTOR:Lab Tech J. Sundaram}}
> Urine Culture: Growth of Escherichia coli detected
> Colony Count: Greater than 10^5 CFU/mL
> Sensitivity: Sensitive to Nitrofurantoin and Ciprofloxacin
Pathologist Signoff: {{DOCTOR:Dr. S. K. Mukherjee}}` },
{ set: "unseen", kind: "PDF with merged columns", text: `{{FACILITY:Surya Genomic Research Institute}}
Patient:{{NAME:Pranjal Borkataky}} RefBy:{{DOCTOR:Dr. Neelam Deka}} LabID:{{ID:SGRI-55109}}
Address:{{ADDRESS:12 Brahmaputra Enclave, Dibrugarh}}
Email:{{CONTACT:p.borkataky@gulfmail.net}}
> Hemoglobin 12.8 g/dL 13.0 - 17.0
> Total Leukocyte Count 7400 cells/cmm 4000 - 11000
> Platelet Count 2.4 lakh/uL 1.5 - 4.1
Verified By: {{DOCTOR:Dr. Hemanta Gogoi}}` },
{ set: "unseen", kind: "Second opinion letter", text: `{{FACILITY:Carepoint Health Clinic}}
{{ADDRESS:90 MG Road, Indore}}
Consultation for: {{NAME:Meenakshi Sundaram}}
Referred from: {{FACILITY:Indore City Hospital}}
Physician: {{DOCTOR:Dr. Aparna Deshmukh}}
Contact: {{CONTACT:aparna.clinic@mailhouse.in}}
Dear Colleague, reviewing previous files for ID {{ID:ICH-33019}}.
> Serum Creatinine: 1.4 mg/dL
> Blood Urea Nitrogen: 28 mg/dL
Recommend nephrology referral and dietary sodium restriction.
Regards, {{DOCTOR:Dr. Aparna Deshmukh}}` },
{ set: "unseen", kind: "Diabetes camp", text: `Rural Health Outreach Camp held at {{ADDRESS:Panchayat Hall, Malwa}}.
Patient: {{NAME:Zoya Mehdi}}, Age: 52, Female, Camp ID: {{ID:MC-88419}}.
Attending Volunteer: {{NAME:Thangjam Singh}}.
Organised by {{FACILITY:Swasthya Gram Foundation}}.
Patient complains of excessive thirst and frequent fatigue.
> Random Blood Sugar: 218 mg/dL
> Prescribed Tablet Metformin 500mg once daily
Referred to {{FACILITY:District Primary Health Centre}} for follow-up.
Note logged by {{NAME:Zubeida Khatun}}.` },
{ set: "unseen", kind: "Home visit nurse note", text: `Home Nursing Assessment for {{NAME:Bhupen Saharia}}, Male, 68.
Visit conducted by {{NAME:Sister Mary Varghese}}, {{FACILITY:Grace Home Care Services}}.
Address: {{ADDRESS:Flat 4B, Lotus Enclave, Guwahati}}.
Patient bedridden post stroke, compliant with vitals monitoring.
Contact number for caregiver: {{CONTACT:9876543210}}.
> Morning Fasting Blood Glucose: 142 mg/dL
> Blood Pressure: 140/90 mmHg
Advised low sodium diet and strict leg elevation.
Next scheduled visit by {{NAME:Sister Mary Varghese}} on Thursday.` },
{ set: "unseen", kind: "Hospital bill and lab slip", text: `INVOICE & PATHOLOGY REPORT - {{FACILITY:Arogya Seva Multispecialty Hospital}}
Bill No: {{ID:INV-77423}}, MRN: {{ID:9928104}}, Date: 14/03/2024.
Patient: {{NAME:Venkatraman Swaminathan}}, Age: 45, Male.
Attending Physician: {{DOCTOR:Dr. K. R. Nambiar}}.
Address: {{ADDRESS:12, Temple Road, Madurai}}.
Phone: {{CONTACT:0452-2554312}}
> Serum Creatinine: 1.4 mg/dL
> Total Serum Cholesterol: 245 mg/dL
Total Amount Payable: Rs. 1850. Paid via UPI.
Verified by {{DOCTOR:Dr. K. R. Nambiar}} and billing clerk {{NAME:Jagdish Roy}}.` },
{ set: "unseen", kind: "Arthritis panel", text: `{{FACILITY:Zenith Diagnostics & Research Centre}}, {{ADDRESS:Sector 5, Salt Lake, Kolkata}}
Patient Name: {{NAME:Gurpreet Kaur}}, Female, Age: 58, Ref No: {{ID:ZEN-99412}}.
Referring Clinician: {{DOCTOR:Dr. Debabrata Sen}}.
Sample Collection Date: 19/02/2024, Lab ID: {{ID:PATH-5532}}.
Test Performed: Comprehensive Arthritis Profile.
> Rheumatoid Factor (RF): 48 IU/mL
> Anti-CCP Antibody: 75.2 U/mL
Interpretation: Values strongly suggestive of active inflammatory arthropathy.
Report authorized by {{DOCTOR:Dr. Sunita Banerjee}}.
End of Report. Contact Lab at {{CONTACT:support@zenithpath.in}} for queries.` },
];
