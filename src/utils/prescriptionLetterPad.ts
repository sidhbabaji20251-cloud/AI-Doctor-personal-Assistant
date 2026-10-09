import { StandardPrescription } from '../types';

export interface LetterPadDetails {
  doctorName: string;
  doctorDegree: string;
  doctorDesignation: string;
  doctorRegistrationSMC: string;
  hospitalClinicName: string;
  clinicAddress: string;
  contactNumber: string;
  patientName: string;
  patientAge: string;
  patientGender: 'Male' | 'Female' | 'Other';
  patientPhone?: string;
  opdNumber: string;
  date: string;
  vitals: {
    bloodPressure?: string;
    pulse?: string;
    weight?: string;
    bloodSugar?: string;
  };
  symptomsAndComplaints: string[];
  provisionalDiagnosis: string;
  showDoctorNameInPlaceOfSignature: boolean;
}

/**
 * Maps known conditions to standard clinical presenting symptoms & complaints
 * as per Golwala Clinical Prescriber and standard Indian clinical medicine.
 */
export function getDefaultSymptomsForCondition(p: StandardPrescription): string[] {
  if (p.symptomsAndComplaints && p.symptomsAndComplaints.length > 0) {
    return p.symptomsAndComplaints;
  }

  const name = (p.diseaseName + ' ' + (p.hindiName || '')).toLowerCase();
  const id = p.id.toLowerCase();

  if (id.includes('dm-') || name.includes('diabetes')) {
    if (id.includes('severe') || name.includes('severe')) {
      return [
        'Persistent polyuria (frequent night-time urination) and unquenchable thirst (polydipsia)',
        'Significant unintentional weight loss, generalized weakness & fatigue',
        'Blurred vision, recurring fungal/skin infections, peripheral numbness in feet',
        'Marked post-prandial lethargy, occasional nausea / sweet-smelling breath',
      ];
    }
    if (id.includes('mod') || name.includes('moderate')) {
      return [
        'Polyuria and increased nocturnal micturition (nocturia)',
        'Polydipsia (frequent thirst) and increased hunger (polyphagia)',
        'Easy fatigability, sluggish wound healing, tingling sensation in toes',
      ];
    }
    return [
      'Mild polyuria (increased frequency of urination)',
      'Polydipsia (increased thirst) & mild daytime fatigue',
      'Occasional blurred vision, post-meal drowsiness',
    ];
  }

  if (id.includes('htn-') || name.includes('hypertension')) {
    if (id.includes('severe') || name.includes('severe')) {
      return [
        'Severe throbbing occipital morning headache and neck stiffness',
        'Episodic dizziness, blurred vision, or photophobia',
        'Palpitations, exertional dyspnea (shortness of breath on mild exertion)',
        'Occasional epistaxis (nosebleeds) and chest heaviness',
      ];
    }
    if (id.includes('mod') || name.includes('moderate')) {
      return [
        'Occipital morning headache and feeling of heavy head',
        'Dizziness / lightheadedness on rapid standing, palpitations',
        'Mild exertional breathlessness, daytime fatigue and irritability',
      ];
    }
    return [
      'Occasional early morning occipital dull headache',
      'Mild dizziness or lightheadedness, mild fatigue',
      'Incidental high BP reading detected on routine OPD check',
    ];
  }

  if (id.includes('asthma') || name.includes('asthma')) {
    if (id.includes('severe') || name.includes('severe')) {
      return [
        'Severe breathlessness (dyspnea) at rest, inability to speak complete sentences',
        'Continuous audible expiratory wheezing and tight chest sensation',
        'Frequent nocturnal coughing attacks waking from sleep, sleep disruption',
        'Poor response to regular relief inhalers, tachypnea',
      ];
    }
    return [
      'Episodic shortness of breath provoked by dust, cold air, or physical exertion',
      'Expiratory wheezing and tight sensation across chest',
      'Nocturnal cough and dry coughing bouts after viral colds',
    ];
  }

  if (id.includes('enteric') || id.includes('typhoid') || name.includes('enteric') || name.includes('typhoid')) {
    return [
      'High-grade step-ladder pyrexia (fever climbing day by day) for 5-8 days',
      'Severe frontal headache, body ache, and profound prostration / malaise',
      'Abdominal discomfort / fullness with coated tongue and bitter taste',
      'Constipation in early phase followed by loose pea-soup stools, loss of appetite',
    ];
  }

  if (id.includes('cad') || name.includes('cad') || name.includes('angina') || name.includes('coronary')) {
    return [
      'Retrosternal constricting / squeezing chest pain provoked by exertion or emotional stress',
      'Radiation of chest ache to left shoulder, inner arm, neck, or lower jaw',
      'Relief within 3 to 5 minutes after resting or taking sublingual nitrates',
      'Associated diaphoresis (cold sweating), mild breathlessness, and anxiety',
    ];
  }

  if (id.includes('pneumonia') || name.includes('pneumonia')) {
    return [
      'High fever with sudden rigors and shaking chills',
      'Productive cough with purulent / rusty-colored tenacious sputum',
      'Sharp pleuritic chest pain on deep inspiration and coughing',
      'Dyspnea (shortness of breath), rapid breathing (tachypnea), and generalized weakness',
    ];
  }

  if (id.includes('uti') || name.includes('uti') || name.includes('urinary tract')) {
    return [
      'Dysuria (sharp burning sensation during micturition)',
      'Marked urinary frequency, urgency, and feeling of incomplete bladder evacuation',
      'Dull aching suprapubic discomfort or lower abdominal heaviness',
      'Turbid, cloudy, foul-smelling urine; low-grade fever with malaise',
    ];
  }

  if (id.includes('pivd') || name.includes('pivd') || name.includes('sciatica') || name.includes('disc')) {
    return [
      'Sharp radiating low backache shooting down buttock into posterior thigh, calf & foot (sciatica)',
      'Pain aggravated by coughing, sneezing, bending forward, or prolonged sitting',
      'Tingling, burning sensation (paresthesia) and numbness in specific dermatome (L4-L5 / L5-S1)',
      'Restricted spinal mobility and positive Straight Leg Raise (SLR) test',
    ];
  }

  if (id.includes('migraine') || name.includes('migraine')) {
    return [
      'Severe unilateral throbbing / pulsating hemicranial headache lasting 4-72 hours',
      'Marked photophobia (intolerance to bright light) and phonophobia (sound sensitivity)',
      'Associated nausea and occasional vomiting; aggravated by routine physical activity',
      'Preceded by visual aura (scintillating scotoma, zigzag lines) in typical attacks',
    ];
  }

  if (id.includes('epilepsy') || name.includes('epilepsy') || name.includes('seizure')) {
    return [
      'Sudden unprovoked loss of consciousness with generalized tonic-clonic jerking of limbs',
      'Associated lateral tongue biting, frothing at mouth, and urinary incontinence during seizure',
      'Post-ictal state of confusion, deep sleepiness, and muscular soreness lasting 30-60 mins',
      'Occasional warning aura (epigastric rising sensation, unusual smells/tastes)',
    ];
  }

  if (id.includes('glaucoma') || name.includes('glaucoma')) {
    return [
      'Severe acute ocular pain in affected eye radiating to ipsilateral forehead and temple',
      'Marked redness of eye (ciliary injection) and blurred steamy vision',
      'Seeing rainbow-colored haloes around bright streetlights or bulbs',
      'Associated systemic nausea, vomiting, and dramatic elevation of eye pressure',
    ];
  }

  if (id.includes('sinusitis') || name.includes('sinusitis')) {
    return [
      'Throbbing facial pain, pressure, and fullness over maxillary cheeks / forehead',
      'Pain dramatically aggravated on bending forward or stooping',
      'Thick, discolored purulent yellow-green nasal discharge and nasal obstruction',
      'Fever, post-nasal drip provoking nocturnal throat clearing, impaired smell (hyposmia)',
    ];
  }

  if (id.includes('uri') || name.includes('upper respiratory') || name.includes('rhinitis')) {
    return [
      'Nasal stuffiness, profuse watery rhinorrhea, and frequent sneezing',
      'Scratchy sore throat, painful swallowing (odynophagia), and dry hacking cough',
      'Low-grade pyrexia, mild frontotemporal headache, malaise, and watery eyes',
    ];
  }

  if (id.includes('diabetic-foot') || name.includes('diabetic foot')) {
    return [
      'Non-healing ulcer / skin breakdown over plantar surface of foot or metatarsal head',
      'Localized swelling, redness, warmth, and seropurulent or malodorous discharge',
      'Loss of protective sensation (numbness, stocking sensory loss) - patient often painless',
      'Thickened hyperkeratotic callus margin surrounding the ulcerative lesion',
    ];
  }

  if (id.includes('hyperthyroid') || name.includes('hyperthyroidism') || name.includes('graves')) {
    return [
      'Resting palpitations, rapid pounding heartbeat (tachycardia), and heat intolerance',
      'Marked weight loss despite normal or increased ravenous appetite (polyphagia)',
      'Fine resting tremors of outstretched fingers, excessive sweating, and moist warm palms',
      'Nervousness, emotional lability, insomnia, muscle weakness, and frequent loose stools',
    ];
  }

  if (id.includes('erectile') || name.includes('erectile') || id.includes('ed')) {
    return [
      'Persistent inability to achieve or maintain penile erection adequate for satisfactory intercourse',
      'Loss or reduction of spontaneous early morning penile erections',
      'Performance anxiety, psychological distress, or reduced sexual libido',
    ];
  }

  if (id.includes('pid') || name.includes('pelvic inflammatory')) {
    return [
      'Continuous dull aching lower abdominal and deep pelvic pain exacerbated by movement',
      'Purulent or abnormal foul-smelling vaginal discharge',
      'Deep dyspareunia (pain during sexual intercourse) and intermenstrual / postcoital spotting',
      'Low-grade fever with chills, lower backache, and marked cervical motion tenderness on exam',
    ];
  }

  if (id.includes('amoebiasis') || name.includes('amoebiasis') || name.includes('dysentery')) {
    return [
      'Intermittent colicky lower abdominal griping pain and abdominal distension',
      'Frequent passage of loose stools mixed with dark brownish mucus and altered blood',
      'Distressing tenesmus (painful spasm with feeling of incomplete evacuation)',
      'Flatulence, malaise, low-grade irregular pyrexia, and coated tongue',
    ];
  }

  if (id.includes('renal-colic') || name.includes('renal colic') || name.includes('stone') || name.includes('calculus')) {
    return [
      'Sudden agonizing, excruciating spasmodic loin-to-groin flank pain radiating to groin / labia / testicle',
      'Patient constantly squirming and unable to find a comfortable lying position (restless)',
      'Dysuria, urinary frequency, urgency, and smoky / frank hematuria (blood in urine)',
      'Associated nausea, profuse diaphoresis, and retching / vomiting due to celiac plexus reflex',
    ];
  }

  // Fallback: Extract from diagnostic criteria or overview
  if (p.diagnosticCriteria && p.diagnosticCriteria.length > 0) {
    return [
      `Chief complaint: Typical clinical presentation of ${p.diseaseName}`,
      ...p.diagnosticCriteria.slice(0, 3).map((c) => `Manifestation / Sign: ${c}`),
    ];
  }

  return [
    `Chief clinical complaint consistent with ${p.diseaseName} (${p.severityLevel})`,
    'Patient presents with typical symptoms per clinical reference guidelines',
    'Vital signs and physical exam compatible with outpatient medical therapy',
  ];
}

/**
 * Returns a complete default letter pad object pre-filled with doctor SMC registration,
 * patient name, symptoms/complaints, provisional diagnosis, and doctor name in place of signature.
 */
export function createDefaultLetterPadDetails(
  p: StandardPrescription,
  doctorName = 'Dr. Rajesh Kumar Yadav',
  doctorRegSMC = 'SMC-48291'
): LetterPadDetails {
  const todayStr = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return {
    doctorName,
    doctorDegree: 'M.B.B.S., M.D. (Internal Medicine)',
    doctorDesignation: 'Senior Consultant Physician',
    doctorRegistrationSMC: doctorRegSMC,
    hospitalClinicName: 'AI DOCTOR PERSONAL ASSISTANT · CLINICAL PRACTICE & TELE-CONSULTATION',
    clinicAddress: 'Govt. Sub-District / Community Health Centre (Rajasthan & Himachal Region)',
    contactNumber: '+91-94140-XXXXX / Helpline: 104',
    patientName: 'Shri / Smt. Rameshwar Sharma',
    patientAge: '48 Yrs',
    patientGender: 'Male',
    patientPhone: '+91-9876543210',
    opdNumber: `OPD-${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`,
    date: todayStr,
    vitals: {
      bloodPressure: '126/82 mmHg',
      pulse: '76 bpm',
      weight: '68 kg',
      bloodSugar: 'Random: 128 mg/dL',
    },
    symptomsAndComplaints: getDefaultSymptomsForCondition(p),
    provisionalDiagnosis: `${p.diseaseName} (${p.severityLevel}) - Category: ${p.category}`,
    showDoctorNameInPlaceOfSignature: true,
  };
}
