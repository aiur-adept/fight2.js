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

function Fight() {
  const { openModal } = useContext(ModalContext);
  const { uuid } = useParams();

  const [ws, setWs] = useState(null);
  const [error, setError] = useState(null);
  const [fightData, setFightData] = useState(null);
  const [player, setPlayer] = useState({});
  const [opponent, setOpponent] = useState({});
  // TODO: replace with proper federated username injection
  const [username, setUsername] = useState(null);
  const [opponentUsername, setOpponentUsername] = useState(null);
  const [messages, setMessages] = useState([]);
  const [options, setOptions] = useState({ list: [], query: '' });
  const [showOptions, setShowOptions] = useState(true);
  const [fightEnded, setFightEnded] = useState(false);

  // refs for use in websocket handler
  const fightDataRef = useRef(null);
  const usernameRef = useRef(null);
  const opponentUsernameRef = useRef(null);
  useEffect(() => {
    fightDataRef.current = fightData;
  }, [fightData]);
  useEffect(() => {
    usernameRef.current = username;
  }, [username]);
  useEffect(() => {
    opponentUsernameRef.current = opponentUsername;
  }, [opponentUsername]);

  // ref needed to set scrollTop
  const outputRef = useRef(null);

  const sendWS = (payload) => {
    payload.fightId = fightData.id;
    payload.user = username;
    ws.send(JSON.stringify(payload))
  }

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
    const initWebSocket = async () => {
      const username = await openModal(TextInputModal, {
        promptText: 'Enter your username',
      });
      setUsername(username);

      const websocket = io(`${window.location.protocol}//${window.location.host}`);
      setWs(websocket);

      websocket.on('connect', () => {
        console.log('joining fight...');
        websocket.send(JSON.stringify({ event: 'fight/join', username, fightId: uuid }));
      });

      websocket.on('disconnect', () => {
        if (!fightEnded) {
          setError('Disconnected');
        }
      });

      websocket.on('message', (msg) => {
        console.log(msg);
        const data = JSON.parse(msg);
        if (data.fightData) {
          setFightData(data.fightData);
        }
        console.log(data);
        switch(data.event) {
          case 'fight/start':
            console.log('FIGHT STARTS');
            break;
          case 'fight/data':
            // nothing to do, since all messages bearing fight data are handled before this switch statement
            break;
          case 'fight/output':
            console.log('fight/output:');
            const className = username === data.attacker ? 'player' : 'opponent'            
            writeToOutput(data.message.content, className);
            break;
          case 'fight/roundStart':
            writeToOutput(`=== START OF ROUND ${fightDataRef.current.round} ===`);
            break;
          case 'fight/roundEnd':
            writeToOutput(`=== END OF ROUND ${fightDataRef.current.round} ===`);
            break;
          case 'fight/canAttack':
            setOptions({ list: data.options, query: 'attack' });
            break;
          case 'fight/canBlock':
            setOptions({ list: data.options, query: 'block' });
            break;
          case 'fight/moveBlocked':
            if (data.fighter === username) {
              writeToOutput('blocked.', 'opponent block');
            } else {
              writeToOutput(`${data.move}`, 'opponent attempt');
              writeToOutput('blocked.', 'player block');
            }
            break;
          case 'fight/moveConnects':
            const isPlayer = data.fighter === username;
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
          case 'fight/end':
            setFightEnded(true);
            // TODO: Do any other actions required when the fight ends; rematch button? main menu button?
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
      initWebSocket();
    }
  }, [uuid, ws]);

  useEffect(() => {
    if (fightData) {
      const playerUsername = username;
      const opponentUsername = fightData.names.find((name) => name !== playerUsername);
      setOpponentUsername(opponentUsername);
      setPlayer(fightData.states[playerUsername]);
      setOpponent(fightData.states[opponentUsername]);
      console.log(`set player & opponent; player = ${playerUsername}, opponent = ${opponentUsername}`);
    }
  }, [fightData, username]);

  const renderMessage = (message, index) => (
    <div key={index} className={`message ${message.classes.join(' ')}`}>
      <span className="pill" dangerouslySetInnerHTML={{ __html: message.text }}></span>
    </div>
  );

  return (
    <>
      {error ? (
        <div>{error}</div>
      ) : (fightData && fightData.names.length == 2) ? (
        <>
          <div id="header" className="header">
            <div id="vitals">
              <div className="row name">
                <div className="vital opponentName">{opponentUsername}</div>
                <div className="vital playerName">{username}</div>
              </div>
              <div className="row health">
                <div className="vital opponentHealth">{opponent.health}</div>
                <div className="vital symbol">❤️</div>
                <div className="vital playerHealth">{player.health}</div>
              </div>
              <div className="row acuity">
                <div className="vital opponentAcuity">{Math.round(opponent.acuity)}</div>
                <div className="vital symbol">💡</div>
                <div className="vital playerAcuity">{Math.round(player.acuity)}</div>
              </div>
              <div className="row submission">
                <div className="vital opponentSubmission">
                  {Math.round(opponent.submissionProgress)}
                </div>
                <div className="vital symbol">🤼</div>
                <div className="vital playerSubmission">
                  {Math.round(player.submissionProgress)}
                </div>
              </div>
            </div>
            <div id="round">{formatRoundDisplay(fightData.round)}</div>
          </div>
          <div id="output" ref={outputRef}>
            {messages.map((message, index) => renderMessage(message, index))}
          </div>
          {showOptions && (
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
          </div>)
          }
        </>
      ) : (
        <p>Waiting for opponent...</p>
      )}
    </>
  );
}

export default Fight;
