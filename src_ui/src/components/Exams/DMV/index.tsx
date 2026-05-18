import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import rpc from 'utils/rpc';

const QUESTIONS = [
  {
    q: "Care dintre vehicule are prioritate de trecere în intersecția prezentată?",
    a: ["Autoturismul albastru", "Autobuzul", "Autoturismul roșu"],
    correct: 1,
    img: "https://placehold.co/600x400/1a1a1a/ffcc00?text=INTERSECTIE+PRIORITATE"
  },
  {
    q: "Ce semnifică indicatorul din imagine?",
    a: ["Sfârșitul drumului cu prioritate", "Cedează trecerea", "Oprire la intersecție"],
    correct: 0,
    img: "https://placehold.co/600x400/1a1a1a/ffcc00?text=INDICATOR+RUTIER"
  },
  {
    q: "Este permisă depășirea în situația din imagine?",
    a: ["Da, dacă vizibilitatea este bună", "Nu, deoarece linia este continuă", "Da, doar dacă viteza este sub 30 km/h"],
    correct: 1,
    img: "https://placehold.co/600x400/1a1a1a/ffcc00?text=SCENARIU+DEPASIRE"
  },
  {
    q: "Ce obligații aveți la întâlnirea indicatorului „Oprire”?",
    a: ["Să oprești fără a depăși colțul intersecției, să te asiguri și să acorzi prioritate", "Să reduci viteza și să oprești doar dacă circulă alte vehicule", "Să oprești la cel puțin 5 metri de intersecție"],
    correct: 0
  },
  {
    q: "Când este permisă depășirea prin partea dreaptă?",
    a: ["În nicio situație", "Când vehiculul din față a semnalizat și s-a încadrat pentru viraj la stânga", "Pe autostradă, dacă banda din stânga este ocupată"],
    correct: 1
  },
  {
    q: "Viteza maximă pe autostradă pentru categoria B este:",
    a: ["110 km/h", "120 km/h", "130 km/h"],
    correct: 2
  },
  {
    q: "Ce indică lumina galbenă intermitentă a semaforului?",
    a: ["Interdicția de a trece", "Permite trecerea cu respectarea regulilor de prioritate", "Obligația de a opri imediat"],
    correct: 1
  },
  {
    q: "Suntem obligați să purtăm centura de siguranță:",
    a: ["Doar în afara localităților", "Doar pe scaunele din față", "Pe toate locurile prevăzute cu acest sistem"],
    correct: 2
  },
  {
    q: "Cum trebuie să procedați când circulați pe un drum cu prioritate și întâlniți indicatorul „Cedează trecerea”?",
    a: ["Nu este posibil să întâlniți ambele semnalizări simultan", "Acordați prioritate doar vehiculelor de poliție", "Respectați indicatorul întâlnit"],
    correct: 0
  },
  {
    q: "Brațul drept ridicat vertical al polițistului rutier înseamnă:",
    a: ["Atenție, oprire pentru toți participanții la trafic care se apropie", "Drum liber", "Trecerea permisă doar pentru vehiculele oficiale"],
    correct: 0
  },
  {
    q: "Peste ce distanță este permisă oprirea în dreptul indicatorului „Curbă periculoasă”?",
    a: ["După curba respectivă", "La cel puțin 50 de metri", "Oprirea este interzisă în curbe"],
    correct: 2
  },
  {
    q: "Circulația pe banda de urgență a autostrăzii este permisă:",
    a: ["În caz de aglomerație", "Pentru a efectua o scurtă pauză", "Doar în caz de imobilizare forțată a vehiculului"],
    correct: 2
  },
  {
    q: "Este permisă întoarcerea pe poduri?",
    a: ["Da, dacă nu circulă alte vehicule", "Nu, este interzis", "Da, dacă podul are cel puțin 2 benzi pe sens"],
    correct: 1
  },
  {
    q: "Ce trebuie să facă un conducător auto care a accidentat un pieton?",
    a: ["Să transporte victima imediat la spital", "Să anunțe poliția și să nu modifice poziția vehiculului", "Să părăsească locul accidentului dacă nu sunt martori"],
    correct: 1
  },
  {
    q: "Când este interzisă depășirea vehiculelor pe drumurile publice?",
    a: ["Pe timp de noapte", "În intersecțiile cu circulație nedirijată", "Când plouă torențial"],
    correct: 1
  },
  {
    q: "Semnalul de culoare roșie al semaforului:",
    a: ["Permite trecerea cu viteză redusă", "Interzice trecerea", "Interzice trecerea, cu excepția celor care virează la dreapta"],
    correct: 1
  },
  {
    q: "Care este distanța minimă de parcare față de trecerea pentru pietoni?",
    a: ["5 metri înainte și după", "25 metri înainte și după", "Nu există o distanță minimă"],
    correct: 1
  },
  {
    q: "Utilizarea luminilor de ceață este permisă:",
    a: ["Permanent, pe timp de noapte", "Doar pe timp de ceață densă", "Când circulăm în coloană"],
    correct: 1
  },
  {
    q: "Când este obligatorie folosirea semnalizării?",
    a: ["Doar când vin alte vehicule", "Cu cel puțin 50m în oraș și 100m în afară, înainte de manevră", "Doar la schimbarea direcției spre stânga"],
    correct: 1
  },
  {
    q: "Prioritatea de dreapta se aplică:",
    a: ["În toate intersecțiile", "În intersecțiile nedirijate", "Doar în intersecțiile în sens giratoriu"],
    correct: 1
  },
  {
    q: "Este permisă depășirea coloanei de vehicule oprite la semafor?",
    a: ["Da, dacă banda opusă este liberă", "Nu", "Doar de către motocicliști"],
    correct: 1
  },
  {
    q: "Ce indică martorul de bord de culoare roșie?",
    a: ["O defecțiune minoră", "O defecțiune gravă sau o stare care necesită oprire imediată", "Faptul că luminile sunt aprinse"],
    correct: 1
  },
  {
    q: "Cum se realizează tractarea unui autovehicul cu sistemul de frânare defect?",
    a: ["Cu o bară rigidă", "Cu un cablu textil", "Prin orice metodă"],
    correct: 0
  },
  {
    q: "Când este interzisă întoarcerea vehiculului?",
    a: ["În intersecțiile cu circulație dirijată", "În locurile unde oprirea este interzisă", "Pe drumurile județene"],
    correct: 1
  },
  {
    q: "Ce semnificație are marcajul longitudinal continuu?",
    a: ["Separă sensurile de mers, iar încălcarea lui este interzisă", "Permite depășirea dacă nu vin mașini", "Indică un drum prioritar"],
    correct: 0
  },
  {
    q: "Cum trebuie să procedezi când ești depășit?",
    a: ["Să mărești viteza pentru a nu încurca", "Să nu mărești viteza și să circuli cât mai aproape de marginea din dreapta", "Să pui frână brusc"],
    correct: 1
  },
  {
    q: "Care este limita de viteză în localități?",
    a: ["40 km/h", "50 km/h", "60 km/h"],
    correct: 1
  },
  {
    q: "Este permisă oprirea voluntară pe trecerile pentru pietoni?",
    a: ["Da, pentru a lăsa pe cineva să coboare", "Nu, este interzis", "Da, dacă nu sunt pietoni"],
    correct: 1
  },
  {
    q: "Ce trebuie să faci la semnalul „Atentie” al polițistului?",
    a: ["Să accelerezi", "Să oprești dacă poți face asta în siguranță", "Să ignori semnalul"],
    correct: 1
  },
  {
    q: "Unde este interzisă manevra de mers înapoi?",
    a: ["Pe drumurile cu sens unic", "În intersecții", "Pe străzile lăturalnice"],
    correct: 1
  },
  {
    q: "Când se folosesc luminile de avarie?",
    a: ["Când parcăm neregulamentar", "Când vehiculul este imobilizat forțat pe carosabil", "Când vrem să mulțumim cuiva"],
    correct: 1
  },
  {
    q: "Pietonii au prioritate atunci când:",
    a: ["Traversează prin orice loc", "Traversează pe la colțul intersecției fără marcaj", "Traversează pe trecerea marcată și semnalizată"],
    correct: 2
  },
  {
    q: "Ce cauzează acvaplanarea?",
    a: ["Viteza mare pe drum umed", "Frânarea bruscă", "Anvelopele prea umflate"],
    correct: 0
  },
  {
    q: "Este permisă depășirea în intersecțiile cu circulație dirijată?",
    a: ["Nu", "Da", "Doar dacă suntem pe drum prioritar"],
    correct: 1
  },
  {
    q: "Cum se circulă în sensul giratoriu?",
    a: ["Prioritate are cel care intră", "Prioritate are cel care circulă în interiorul acestuia", "Se aplică prioritatea de dreapta"],
    correct: 1
  },
  {
    q: "Ce documente trebuie să ai asupra ta la control?",
    a: ["Doar permisul", "Buletinul și asigurarea", "Permis, certificat de înmatriculare și asigurare"],
    correct: 2
  },
  {
    q: "Când este interzisă staționarea?",
    a: ["În dreptul căilor de acces ale proprietăților alăturate", "Pe drumurile cu sens unic", "În fața magazinelor"],
    correct: 0
  },
  {
    q: "Ce trebuie să verifici înainte de a porni motorul?",
    a: ["Poziția oglinzilor și a scaunului", "Nivelul combustibilului", "Dacă farurile sunt aprinse"],
    correct: 0
  },
  {
    q: "Cum afectează alcoolul conducerea?",
    a: ["Mărește timpul de reacție", "Îmbunătățește atenția", "Reduce distanța de frânare"],
    correct: 0
  },
  {
    q: "Este permisă utilizarea telefonului fără hands-free?",
    a: ["Da, la semafor", "Nu, este interzis prin lege", "Doar pentru mesaje scurte"],
    correct: 1
  },
  {
    q: "Care este rolul sistemului ABS?",
    a: ["Mărește viteza maximă", "Împiedică blocarea roților la frânare", "Reduce consumul de carburant"],
    correct: 1
  },
  {
    q: "Ce faci dacă observi un accident cu victime?",
    a: ["Pleci mai departe", "Suni la 112 și acorzi primul ajutor dacă știi", "Faci poze pentru rețelele sociale"],
    correct: 1
  },
  {
    q: "Ce înseamnă un triunghi roșu cu vârful în jos?",
    a: ["Oprire", "Cedează trecerea", "Drum cu prioritate"],
    correct: 1,
    img: "https://placehold.co/600x400/1a1a1a/ffcc00?text=CEDEAZE+TRECEREA"
  }
];

const DMVExam = () => {
  const [currentStep, setCurrentStep] = useState('start');
  const [activeQuestions, setActiveQuestions] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Block Forbidden keys
      if (currentStep !== 'hidden') {
        const blockedKeys = ['Escape', 'F10', 'F12', 't', 'T'];
        if (blockedKeys.includes(e.key)) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [currentStep]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [timeLeft, setTimeLeft] = useState(600); 
  const [userAnswers, setUserAnswers] = useState<any[]>([]);

  useEffect(() => {
    let timer: any;
    if (currentStep === 'quiz' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && currentStep === 'quiz') {
      finishExam();
    }
    return () => clearInterval(timer);
  }, [currentStep, timeLeft]);

  const startExam = async (paymentType: string) => {
    setErrorMessage(null);
    const success = await rpc.callClient('DMV-StartExam', paymentType);
    if (success) {
      const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 20);
      setActiveQuestions(shuffled);
      setCurrentStep('quiz');
      setTimeLeft(600);
      setScore(0);
      setMistakes(0);
      setCurrentQuestionIndex(0);
      setUserAnswers(Array(shuffled.length).fill(null));
    } else {
      setErrorMessage("Nu ai suficienți bani pentru a susține examenul!");
      // Ensure the error stays long enough to be read
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  const handleAnswer = (answerIndex: number) => {
    const previousAnswer = userAnswers[currentQuestionIndex];
    if (previousAnswer === answerIndex) return;

    const isCorrect = answerIndex === activeQuestions[currentQuestionIndex].correct;
    
    let updatedScore = score;
    let updatedMistakes = mistakes;

    if (previousAnswer !== null) {
      const wasPreviousCorrect = previousAnswer === activeQuestions[currentQuestionIndex].correct;
      if (wasPreviousCorrect) updatedScore -= 1;
      else updatedMistakes -= 1;
    }

    if (isCorrect) updatedScore += 1;
    else updatedMistakes += 1;

    setScore(updatedScore);
    setMistakes(updatedMistakes);

    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setUserAnswers(newAnswers);

    if (updatedMistakes >= 5) {
      finishExam();
      return;
    }

    if (previousAnswer === null && currentQuestionIndex < activeQuestions.length - 1) {
      setTimeout(() => setCurrentQuestionIndex(prev => prev + 1), 300);
    }
  };

  const finishExam = () => {
    const passed = score >= 17 && mistakes < 5;
    rpc.callClient('DMV-FinishExam', passed);
    setCurrentStep('result');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const exitExam = () => {
    rpc.callClient('DMV-Close');
    setCurrentStep('hidden');
  }

  return (
    <div className={`dmv-ui-wrapper ${currentStep === 'hidden' ? 'dmv-ui-hidden' : ''}`}>
      <div className="dmv-ui-container">
        <header className="dmv-ui-header">
          <h1 className="dmv-ui-logo">DMV EXAMEN</h1>
          
          <div className="dmv-ui-header-right">
            <div className="dmv-ui-timer-card">
              <span className="dmv-ui-timer-text">
                TIMP RĂMAS: <span className="dmv-ui-timer-highlight">{formatTime(timeLeft)}</span>
              </span>
            </div>
            
            <button 
              onClick={exitExam}
              className="dmv-ui-btn-close"
              title="Închide Examenul"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="dmv-ui-icon-close">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </header>

        {currentStep === 'start' && (
          <div className="dmv-ui-card-main dmv-ui-anim-fade">
            <h2 className="dmv-ui-title-hero">Gata de examinare?</h2>
            <p className="dmv-ui-text-desc">Testul conține 20 de întrebări aleatorii. Ai nevoie de minim 17 răspunsuri corecte pentru a promova.</p>
            
            {errorMessage && (
              <div className="dmv-ui-error-msg">
                {errorMessage}
              </div>
            )}

            <div className="dmv-ui-actions-row">
              <button onClick={() => startExam('cash')} className="dmv-ui-btn-action">
                PLATESTE CASH (1000 RON)
              </button>
              <button onClick={() => startExam('bank')} className="dmv-ui-btn-action">
                PLATESTE CU CARDUL (1000 RON)
              </button>
            </div>
          </div>
        )}

        {currentStep === 'quiz' && activeQuestions.length > 0 && (
          <div className="dmv-ui-quiz-layout dmv-ui-anim-slide">
            <div className="dmv-ui-card-question">
                <div className="dmv-ui-question-content">
                    <span className="dmv-ui-step-label">
                        ÎNTREBAREA {currentQuestionIndex + 1} / {activeQuestions.length}
                    </span>
                    {activeQuestions[currentQuestionIndex].img && (
                      <img 
                        src={activeQuestions[currentQuestionIndex].img} 
                        alt="Situatie trafic" 
                        className="dmv-ui-question-img"
                        onError={(e: any) => e.target.src = "https://placehold.co/600x400/1a1a1a/ffcc00?text=SITUATIE+TRAFIC"}
                      />
                    )}
                    <h3 className="dmv-ui-question-title">
                        {activeQuestions[currentQuestionIndex].q}
                    </h3>
                </div>
            </div>

            <div className="dmv-ui-answers-list">
              {activeQuestions[currentQuestionIndex].a.map((ans: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  className={`dmv-ui-option-item ${userAnswers[currentQuestionIndex] === idx ? 'is-selected' : ''}`}
                >
                  <span className="dmv-ui-option-text">{ans}</span>
                  <div className="dmv-ui-option-radio">
                    {userAnswers[currentQuestionIndex] === idx && <div className="dmv-ui-radio-dot" />}
                  </div>
                </button>
              ))}

              <div className="dmv-ui-nav-bar">
                <button 
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                  className="dmv-ui-btn-nav"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="dmv-ui-icon-nav">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg> inapoi
                </button>
                <button 
                  disabled={currentQuestionIndex === activeQuestions.length - 1}
                  onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                  className="dmv-ui-btn-nav"
                >
                  inainte <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="dmv-ui-icon-nav">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </div>
              
              {userAnswers.filter(a => a !== null).length === activeQuestions.length && (
                <button onClick={finishExam} className="dmv-ui-btn-submit">
                  FINALIZEAZĂ EXAMENUL
                </button>
              )}
            </div>
          </div>
        )}

        {currentStep === 'result' && (
          <div className="dmv-ui-card-main dmv-ui-anim-zoom">
            {score >= 17 && mistakes < 5 ? (
              <>
                <div className="dmv-ui-result-icon-box dmv-ui-success-bg">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="dmv-ui-result-icon dmv-ui-text-success">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <h2 className="dmv-ui-result-label dmv-ui-text-success">ADMIS</h2>
                <p className="dmv-ui-text-desc">Felicitari! Ai promovat examenul teoretic cu scorul de {score}/{activeQuestions.length}.</p>
                <button onClick={exitExam} className="dmv-ui-btn-action">
                    ÎNCHIDE
                </button>
              </>
            ) : (
              <>
                <div className="dmv-ui-result-icon-box dmv-ui-fail-bg">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="dmv-ui-result-icon dmv-ui-text-fail">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                  </svg>
                </div>
                <h2 className="dmv-ui-result-label dmv-ui-text-fail">RESPINS</h2>
                <p className="dmv-ui-text-error-bold">
                  DIN PĂCATE NU AI TRECUT EXAMENUL! AI ACUMULAT {mistakes} GREȘELI DIN MAXIM 4 PERMISE
                </p>
                <button onClick={() => setCurrentStep('start')} className="dmv-ui-btn-action">
                    REÎNCEARCĂ EXAMENUL
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <style>{`
        .dmv-ui-wrapper {
          min-height: 100vh;
          background-color: #0d0d0d;
          color: white;
          padding: 4vh 5vw;
          box-sizing: border-box;
          font-family: 'Inter', sans-serif;
          user-select: none;
        }

        .dmv-ui-container {
          max-width: 80vw;
          margin: 0 auto;
          width: 100%;
        }

        .dmv-ui-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 5vh;
          padding: 0 1vw;
        }

        .dmv-ui-logo {
          font-size: 3vw;
          font-weight: 900;
          font-style: italic;
          color: #ffcc00;
          letter-spacing: -0.1vw;
          text-transform: uppercase;
        }

        .dmv-ui-header-right {
          display: flex;
          gap: 1vw;
        }

        .dmv-ui-timer-card {
          background-color: #1a1a1a;
          border: 0.1vw solid rgba(255, 255, 255, 0.05);
          border-radius: 0.8vw;
          padding: 0 1.5vw;
          display: flex;
          align-items: center;
          height: 5vh;
        }

        .dmv-ui-timer-text {
          font-size: 0.9vw;
          color: #d1d5db;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.05vw;
        }

        .dmv-ui-timer-highlight {
          color: #ffcc00;
          margin-left: 0.5vw;
        }

        .dmv-ui-btn-close {
          background-color: #dc2626;
          border-radius: 0.8vw;
          width: 5vh;
          height: 5vh;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: none;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .dmv-ui-btn-close:hover {
          background-color: #ef4444;
          transform: rotate(90deg);
        }

        .dmv-ui-icon-close {
          color: white;
          width: 1.5vw;
          height: 1.5vw;
        }

        .dmv-ui-card-main {
          background-color: #141414;
          border-radius: 2vw;
          padding: 8vh 5vw;
          border: 0.1vw solid rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          box-shadow: 0 4vh 10vh -5vh rgba(0,0,0,0.5);
        }

        .dmv-ui-title-hero {
          font-size: 4vw;
          font-weight: 900;
          font-style: italic;
          margin-bottom: 3vh;
          text-transform: uppercase;
        }

        .dmv-ui-text-desc {
          color: #9ca3af;
          margin-bottom: 6vh;
          max-width: 40vw;
          font-size: 1.3vw;
          line-height: 1.5;
        }

        .dmv-ui-text-error-bold {
          color: #9ca3af;
          margin-bottom: 6vh;
          font-weight: 900;
          font-style: italic;
          text-transform: uppercase;
          font-size: 1.2vw;
        }

        .dmv-ui-actions-row {
          display: flex;
          gap: 2vw;
          justify-content: center;
          flex-wrap: wrap;
          width: 100%;
        }

        .dmv-ui-btn-action {
          background-color: #ffcc00;
          color: black;
          font-weight: 900;
          font-style: italic;
          padding: 2.5vh 4vw;
          border-radius: 1vw;
          font-size: 1.1vw;
          text-transform: uppercase;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 1vh 4vh -1vh rgba(255, 204, 0, 0.3);
        }

        .dmv-ui-btn-action:hover {
          transform: translateY(-0.5vh);
          box-shadow: 0 1.5vh 5vh -1vh rgba(255, 204, 0, 0.4);
          background-color: #ffe066;
        }

        .dmv-ui-btn-action:active {
          transform: translateY(0);
        }

        .dmv-ui-quiz-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3vw;
        }

        .dmv-ui-card-question {
          background-color: #141414;
          padding: 6vh 3vw;
          border-radius: 2vw;
          border: 0.1vw solid rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-height: 45vh;
        }

        .dmv-ui-step-label {
          color: #ffcc00;
          font-weight: 900;
          font-style: italic;
          font-size: 1vw;
          text-transform: uppercase;
          display: block;
          margin-bottom: 2vh;
        }

        .dmv-ui-question-title {
          font-size: 1.8vw;
          font-weight: 700;
          line-height: 1.3;
        }

        .dmv-ui-question-img {
          width: 100%;
          height: 28vh;
          object-fit: cover;
          border-radius: 1.5vw;
          margin-bottom: 3vh;
          border: 0.2vw solid rgba(255, 204, 0, 0.1);
        }

        .dmv-ui-answers-list {
          display: flex;
          flex-direction: column;
          gap: 2vh;
        }

        .dmv-ui-option-item {
          background-color: #141414;
          border: 0.1vw solid rgba(255, 255, 255, 0.05);
          padding: 3vh 2.5vw;
          border-radius: 1vw;
          display: flex;
          align-items: center;
          justify-content: space-between;
          text-align: left;
          cursor: pointer;
          transition: all 0.25s ease;
          width: 100%;
          color: inherit;
        }

        .dmv-ui-option-item:hover {
          background-color: rgba(255, 204, 0, 0.05);
          border-color: rgba(255, 204, 0, 0.4);
        }

        .dmv-ui-option-item.is-selected {
          background-color: #ffcc00;
          border-color: #ffcc00;
          color: black;
          transform: translateX(0.5vw);
        }

        .dmv-ui-option-text {
          font-weight: 700;
          font-size: 1.1vw;
        }

        .dmv-ui-option-radio {
          width: 1.6vw;
          height: 1.6vw;
          border-radius: 50%;
          border: 0.2vw solid rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .is-selected .dmv-ui-option-radio {
          border-color: rgba(0, 0, 0, 0.3);
        }

        .dmv-ui-radio-dot {
          width: 0.8vw;
          height: 0.8vw;
          background-color: black;
          border-radius: 50%;
        }

        .dmv-ui-nav-bar {
          display: flex;
          gap: 1.5vw;
          margin-top: 1vh;
        }

        .dmv-ui-btn-nav {
          flex: 1;
          background-color: #1a1a1a;
          border: 0.1vw solid rgba(255, 255, 255, 0.05);
          padding: 2.2vh;
          border-radius: 1vw;
          font-weight: 900;
          font-style: italic;
          font-size: 0.9vw;
          text-transform: uppercase;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5vw;
          color: white;
          transition: all 0.3s ease;
        }

        .dmv-ui-btn-nav:hover:not(:disabled) {
          background-color: #262626;
        }

        .dmv-ui-btn-nav:disabled {
          opacity: 0.2;
          cursor: not-allowed;
        }

        .dmv-ui-icon-nav {
          width: 1.2vw;
          height: 1.2vw;
        }

        .dmv-ui-btn-submit {
          width: 100%;
          background-color: #16a34a;
          padding: 2.5vh;
          border-radius: 1vw;
          font-weight: 900;
          font-style: italic;
          font-size: 1vw;
          text-transform: uppercase;
          border: none;
          cursor: pointer;
          color: white;
          margin-top: 1vh;
          transition: all 0.3s ease;
          box-shadow: 0 1vh 3vh -1vh rgba(22, 163, 74, 0.3);
        }

        .dmv-ui-btn-submit:hover {
          background-color: #15803d;
          box-shadow: 0 1.5vh 4vh -1vh rgba(22, 163, 74, 0.4);
        }

        .dmv-ui-result-icon-box {
          width: 9vw;
          height: 9vw;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 4vh;
        }

        .dmv-ui-success-bg { background-color: rgba(34, 197, 94, 0.1); }
        .dmv-ui-fail-bg { background-color: rgba(239, 68, 68, 0.1); }

        .dmv-ui-result-icon { width: 4.5vw; height: 4.5vw; }
        .dmv-ui-text-success { color: #22c55e; }
        .dmv-ui-text-fail { color: #ef4444; }

        .dmv-ui-result-label {
          font-size: 3.5vw;
          font-weight: 900;
          font-style: italic;
          text-transform: uppercase;
          margin-bottom: 2vh;
        }

        .dmv-ui-anim-fade { animation: dmvFadeIn 0.8s ease; }
        .dmv-ui-anim-slide { animation: dmvSlideUp 0.6s ease; }
        .dmv-ui-anim-zoom { animation: dmvZoomIn 0.6s ease; }

        @keyframes dmvFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes dmvSlideUp { from { opacity: 0; transform: translateY(4vh); } to { opacity: 1; transform: translateY(0); } }
        @keyframes dmvZoomIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }

        .dmv-ui-hidden {
          display: none !important;
        }

        .dmv-ui-error-msg {
          background-color: rgba(220, 38, 38, 0.1);
          color: #ef4444;
          padding: 1.5vh 2vw;
          border-radius: 0.8vw;
          border: 0.1vw solid rgba(220, 38, 38, 0.2);
          margin-bottom: 3vh;
          font-weight: 700;
          font-size: 0.9vw;
          text-transform: uppercase;
          animation: dmvFadeIn 0.3s ease;
        }

        @media (max-width: 768px) {
          .dmv-ui-quiz-layout { grid-template-columns: 1fr; }
          .dmv-ui-logo { font-size: 7vw; }
          .dmv-ui-question-title { font-size: 4.5vw; }
          .dmv-ui-option-text { font-size: 4vw; }
          .dmv-ui-title-hero { font-size: 9vw; }
          .dmv-ui-btn-action { font-size: 3.5vw; }
        }
      `}</style>
    </div>
  );
};

export default DMVExam;
