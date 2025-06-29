import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { io } from "socket.io-client";
import ModalContext from './modal-context';
import TextInputModal from './text-input-modal';

function formatRoundDisplay(round) {
  const maxRound = 3;
  const emptySpace = "-";
  const goldColor = { color: "gold" };
  const roundDisplay = Array.from({ length: maxRound }, (v, i) =>
    i + 1 === round ? (
      <span key={i} style={goldColor}>
        R{round}
      </span>
    ) : i < round ? (
      <span key={i} style={goldColor}>
        {emptySpace}
      </span>
    ) : (
      <span key={i}>
        {emptySpace}
      </span>
    )
  );
  return roundDisplay;
}

function truncateName(name) {
  if (!name) return '';
  return name.length > 18 ? name.slice(0, 18) : name;
}

function Fight() {
  const { openModal } = useContext(ModalContext);
  const { uuid } = useParams();

  const [ws, setWs] = useState(null);
  const [error, setError] = useState(null);
  const [fightData, setFightData] = useState(null);
  const [player, setPlayer] = useState({});
  const [opponent, setOpponent] = useState({});
  const [username, setUsername] = useState(null);
  const [email, setEmail] = useState(null);
  const [opponentUsername, setOpponentUsername] = useState(null);
  const [messages, setMessages] = useState([]);
  const [options, setOptions] = useState({ list: [], query: '' });
  const [showOptions, setShowOptions] = useState(true);
  const [fightEnded, setFightEnded] = useState(false);

  const fightDataRef = useRef(null);
  const usernameRef = useRef(null);
  const emailRef = useRef(null);
  const opponentUsernameRef = useRef(null);
  useEffect(() => { fightDataRef.current = fightData; }, [fightData]);
  useEffect(() => { usernameRef.current = username; }, [username]);
  useEffect(() => { emailRef.current = email; }, [email]);
  useEffect(() => { opponentUsernameRef.current = opponentUsername; }, [opponentUsername]);

  const outputRef = useRef(null);

  useEffect(() => {
    if (fightData) {
      const playerUsername = username;
      const opponentUsername = fightData.names.find((name) => name !== playerUsername);
      setOpponentUsername(opponentUsername);
      setPlayer(fightData.states[playerUsername]);
      setOpponent(fightData.states[opponentUsername]);
    }
  }, [fightData, username]);

  // Set #output maxHeight to 50% on fight end
  useEffect(() => {
    if (fightEnded && outputRef.current) {
      outputRef.current.style.maxHeight = '50%';
    } else if (outputRef.current) {
      outputRef.current.style.maxHeight = '';
    }
  }, [fightEnded]);

  const sendWS = (payload) => {
    payload.fightId = fightData.id;
    payload.user = username;
    ws.send(JSON.stringify(payload))
  }

  const renderMessage = (message, index) => (
    <div key={index} className={`message ${message.classes.join(' ')}`}>
      <span className="pill" dangerouslySetInnerHTML={{ __html: message.text }}></span>
    </div>
  );

  const writeToOutput = (text, classes = 'info') => {
    const message = {
      text: text || '',
      classes: classes.split(' '),
    };
    setMessages((prevMessages) => {
      setTimeout(() => {
        if (outputRef.current) {
          outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
      }, 0);
      return [...prevMessages, message];
    });
  };

  const handleOptionClick = async (option) => {
    let payload = {
      event: `fight/${options.query}`
    };
    payload[options.query] = option;
    sendWS(payload);
    setOptions({ list: [], query: '' });
    if (options.query === 'attack' && option !== 'feel-out') {
      writeToOutput(`${option}`, 'player attempt');
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const response = await fetch('/api/user');
      if (response.ok) {
        const userData = await response.json();
        setUsername(truncateName(userData.displayName));
        setEmail(userData.email);
      } else {
        let username = await openModal(TextInputModal, {
          promptText: 'Enter your fighter name',
        });
        username = truncateName(username);
        setUsername(username);
      }
    };

    const initWebSocket = async () => {
      const websocket = io(`${window.location.protocol}//${window.location.host}`);
      setWs(websocket);

      websocket.on('connect', () => {
        websocket.send(JSON.stringify({ event: 'fight/join', username: usernameRef.current, email: emailRef.current, fightId: uuid }));
      });

      websocket.on('disconnect', () => {
        if (!fightEnded) {
          setError('Disconnected');
        }
      });

      websocket.on('message', (msg) => {
        const data = JSON.parse(msg);
        if (data.fightData) {
          setFightData(data.fightData);
        }
        console.log(data);
        switch(data.event) {
          case 'fight/start':
            break;
          case 'fight/data':
            setFightData(data.fightData);
            break;
          case 'fight/output':
            const className = usernameRef.current === data.attacker ? 'player' : 'opponent'            
            writeToOutput(data.message.content, className);
            break;
          case 'fight/roundStart':
            writeToOutput(`=== START OF ROUND ${data.fightData.round} ===`);
            break;
          case 'fight/roundEnd':
            writeToOutput(`=== END OF ROUND ${data.fightData.round} ===`);
            break;
          case 'fight/canAttack':
            setOptions({ list: data.options, query: 'attack' });
            break;
          case 'fight/canBlock':
            setOptions({ list: data.options, query: 'block' });
            break;
          case 'fight/moveBlocked':
            if (data.fighter === usernameRef.current) {
              writeToOutput('blocked.', 'opponent block');
            } else {
              writeToOutput(`${data.move}`, 'opponent attempt');
              writeToOutput('blocked.', 'player block');
            }
            break;
          case 'fight/moveConnects':
            const isPlayer = data.fighter === usernameRef.current;
            if (fightDataRef.current.mode === 'standing') {
              if (data.move === 'grapple') {
                writeToOutput(`Takedown by ${isPlayer ? usernameRef.current : opponentUsernameRef.current}!`, 
                                isPlayer ? 'player green' : 'opponent red');
              } else {
                writeToOutput(`'${data.move}' connects!`, isPlayer ? 'player green' : 'opponent red');
              }
            } else {
              writeToOutput(`'${data.move}' succeeds!`, isPlayer ? 'player green' : 'opponent red');
            }
            break;
          case 'fight/stoppage':
            data.messages.forEach((message) => {
              writeToOutput(message.content, message.className);
            });
            setOptions({ list: [], query: '' });
            break;
          case 'fight/judgeDecision':
            data.messages.forEach((message) => {
              writeToOutput(message.content, message.className);
            });
            setOptions({ list: [], query: '' });
            break;
          case 'fight/end':
            setFightEnded(true);
            break;
        }
        if (data.type === 'error') {
          setError(data.message);
        }
      });

      return () => {
        websocket.close();
      };
    };

    if (!ws) {
      fetchUser().then(() => {
        initWebSocket();
      });
    }
  }, [uuid, ws, openModal]);

  return (
    <>
      {error ? (
        <div>
          <div>{error}</div>
          <p>
            <button onClick={() => window.location.href = '/'}>Back to main menu</button>
          </p>
        </div>
      ) : !fightData ? (
        <p>Waiting for opponent...</p>
      ) : (
        <>
          <div id="header" className="header">
            <div id="vitals">
              <div className="vitalRow name">
                <div className="vital opponentName">{truncateName(opponentUsername)}</div>
                <div className="vital playerName">{truncateName(username)}</div>
              </div>
              <div className="vitalRow health">
                <div className="vital opponentHealth">{opponent.health || 0}</div>
                <div className="vital symbol">❤️</div>
                <div className="vital playerHealth">{player.health || 0}</div>
              </div>
              <div className="vitalRow acuity">
                <div className="vital opponentAcuity">{Math.round(opponent.acuity) || 0}</div>
                <div className="vital symbol">💡</div>
                <div className="vital playerAcuity">{Math.round(player.acuity) || 0}</div>
              </div>
              <div className="vitalRow submission">
                <div className="vital opponentSubmission">
                  {Math.round(opponent.submissionProgress) || 0}
                </div>
                <div className="vital symbol">🤼</div>
                <div className="vital playerSubmission">
                  {Math.round(player.submissionProgress) || 0}
                </div>
              </div>
            </div>
            <div id="round">{formatRoundDisplay(fightData.round)}</div>
          </div>
          <div
            id="output"
            ref={outputRef}
          >
            {messages.map((message, index) => renderMessage(message, index))}
          </div>

          {!fightEnded && showOptions && (
            <div id="options" className="footer">
              {options.query && <div className="query">{options.query}</div>}
              <div className="grid">
                <div className="gridList">
                  {options.list.map((option, index) => (
                    <div
                      key={index}
                      className="clickable-option"
                      data-value={index + 1}
                      onClick={() => handleOptionClick(option)}
                    >
                      <div className="label">{option}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {fightEnded && (
            <div className="footer" style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: 24,
              background: '#fff',
              borderTop: '1px solid #e0e0e0',
              boxShadow: '0 -2px 8px rgba(60, 64, 67, 0.04)'
            }}>
              <div style={{
                fontFamily: 'Roboto, Arial, sans-serif',
                fontWeight: 500,
                fontSize: 20,
                color: '#1976d2',
                marginBottom: 16,
                letterSpacing: 0.2
              }}>
                Fight ended
              </div>
              <button
                onClick={() => window.location.href = '/'}
                style={{
                  background: '#1976d2',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  padding: '12px 28px',
                  fontSize: 16,
                  fontWeight: 500,
                  fontFamily: 'Roboto, Arial, sans-serif',
                  boxShadow: '0 2px 8px rgba(25, 118, 210, 0.10)',
                  cursor: 'pointer',
                  transition: 'background 0.18s, box-shadow 0.18s',
                  outline: 'none'
                }}
                onMouseOver={e => {
                  e.currentTarget.style.background = '#1565c0';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(25, 118, 210, 0.16)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = '#1976d2';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(25, 118, 210, 0.10)';
                }}
              >
                Back to main menu
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}

export default Fight;
