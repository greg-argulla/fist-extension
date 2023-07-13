/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import OBR from "@owlbear-rodeo/sdk";
import landingBG from "./assets/bg.jpg";
import refresh from "./assets/refresh.png";
import "./App.css";

const Text = (props) => {
  const { children } = props;
  return <span className="outline">{children}</span>;
};

function App() {
  const [FRC, setFRC] = useState(0);
  const [TAC, setTAC] = useState(0);
  const [CRE, setCRE] = useState(0);
  const [RFX, setRFX] = useState(0);
  const [MOD, setMOD] = useState(0);
  const [diceCount, setDiceCount] = useState(0);
  const [text, setText] = useState("");
  const [isOBRReady, setIsOBRReady] = useState(false);
  const [cooldown, setCoolDown] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [name, setName] = useState("");
  const [id, setId] = useState("");
  const [role, setRole] = useState("PLAYER");
  const [chat, setChat] = useState([]);
  const [chatToCheckChanges, setChatToCheckChanges] = useState([]);
  const [myChat, setMyChat] = useState([]);
  const [cookiesNotEnabled, setCookiesNotEnabled] = useState(false);

  const setToPM = (user) => {
    if (role === "GM") {
      setText("[" + user + "]");
    }
  };

  function evaluateMath(str) {
    for (var i = 0; i < str.length; i++) {
      if (isNaN(str[i]) && !["+", "-", "/", "*"].includes(str[i])) {
        return NaN;
      }
    }

    try {
      return eval(str);
    } catch (e) {
      if (e.name !== "SyntaxError") throw e;
      return NaN;
    }
  }

  const rollInstance = (item, index) => {
    return (
      <div className="roll-detail" style={{ textAlign: "center" }}>
        * {item.characterName ? `${item.characterName}` : item.user} Rolled{" "}
        <span style={{ color: "#FFF" }}>{item.result}</span>
        {item.diceOneResult} {item.diceLabelOne}
        {item.diceTwoResult !== 0 ? (
          <>{` + ${item.diceTwoResult} ${item.diceLabelTwo}`}</>
        ) : (
          ""
        )}
        {!isNaN(parseInt(item.bonus)) && parseInt(item.bonus) !== 0
          ? (parseInt(item.bonus) > -1 ? " + " : " - ") + Math.abs(item.bonus)
          : ""}
        {(item.diceTwoResult !== 0 ||
          (!isNaN(parseInt(item.bonus)) && parseInt(item.bonus) !== 0)) &&
          ` = `}
        {item.diceTwoResult === 0 &&
          !isNaN(parseInt(item.bonus)) &&
          parseInt(item.bonus) !== 0 && (
            <span
              style={{
                marginRight: 2,
                marginLeft: 2,
                fontSize: 11,
              }}
            >
              {item.diceOneResult + item.bonus}
            </span>
          )}
        {item.diceTwoResult !== 0 && (
          <span
            style={{
              color:
                (item.diceOneResult + item.diceTwoResult + item.bonus) % 2 === 0
                  ? "lightgreen"
                  : "lightblue",
              marginRight: 2,
              marginLeft: 2,
              fontSize: 11,
            }}
          >
            {item.diceOneResult + item.diceTwoResult + item.bonus}
          </span>
        )}
        {parseInt(item.damage) > 0
          ? (item.useHR ? ` HR: ${HR} ` : " ") + "DMG:"
          : ""}
        {parseInt(item.damage) > 0 ? (
          <span
            style={{
              color: "red",
              marginRight: 2,
              marginLeft: 2,
              fontSize: 11,
            }}
          >
            {item.useHR ? HR + item.damage : item.damage}
          </span>
        ) : (
          ""
        )}
        {item.diceOneResult === item.diceTwoResult &&
          item.diceOneResult > 5 && (
            <>
              <span
                style={{ color: "#FF4500" }}
                className={index > chat.length - 8 ? "crit" : ""}
              >
                CRITICAL
              </span>
            </>
          )}
        {item.diceOneResult === item.diceTwoResult &&
          item.diceOneResult < 6 &&
          item.diceOneResult > 1 && <span style={{ color: "orange" }}>*</span>}
      </div>
    );
  };

  const getImage = (str) => {
    return str.substring(str.indexOf("<") + 1, str.lastIndexOf(">"));
  };

  const ChatInstance = (props) => {
    let propsString = JSON.stringify(props);
    const imageURL = getImage(propsString);

    if (imageURL) {
      propsString = propsString.replace("<" + imageURL + ">", "");
    }

    const { item, index } = JSON.parse(propsString);

    if (item.message || imageURL) {
      if (item.message.charAt(0) === "=") {
        const mathToEvaluate = item.message.substring(1, item.message.length);
        return (
          <div className="outline" style={{ marginTop: 4 }}>
            <div onClick={() => setToPM(item.user)}>{item.user}</div>
            <span style={{ color: "#D2691E" }}>
              {mathToEvaluate + " = " + evaluateMath(mathToEvaluate)}
            </span>
            {imageURL && (
              <div
                style={{
                  backgroundImage: `url(${imageURL})`,
                  backgroundSize: "cover",
                  height: 150,
                  width: 200,
                  overflow: "hidden",
                  borderRadius: 5,
                }}
              ></div>
            )}
          </div>
        );
      }

      if (item.user === name) {
        return (
          <div className="outline" style={{ textAlign: "right", marginTop: 4 }}>
            <div onClick={() => setToPM(item.user)}>{item.user}</div>
            <span style={{ color: item.whisper ? "violet" : "#FFF" }}>
              {item.whisper ? "*" : ""}
              {item.message}
              {item.whisperTarget ? " - " + item.whisperTarget : ""}
              {item.whisper ? "*" : ""}
            </span>
            {imageURL && (
              <div
                style={{
                  backgroundImage: `url(${imageURL})`,
                  backgroundSize: "cover",
                  height: 150,
                  width: 200,
                  overflow: "hidden",
                  borderRadius: 5,
                  marginLeft: "auto",
                }}
              ></div>
            )}
          </div>
        );
      }

      if (!item.whisper || role === "GM") {
        return (
          <div className="outline" style={{ marginTop: 4 }}>
            <div onClick={() => setToPM(item.user)}>{item.user}</div>
            <span style={{ color: item.whisper ? "violet" : "#FFF" }}>
              {item.whisper ? "*" : ""}
              {item.message}
              {item.whisper ? "*" : ""}
            </span>
            {imageURL && (
              <div
                style={{
                  backgroundImage: `url(${imageURL})`,
                  backgroundSize: "cover",
                  height: 150,
                  width: 200,
                  overflow: "hidden",
                  borderRadius: 5,
                }}
              ></div>
            )}
          </div>
        );
      }

      if (item.whisper && item.whisperTarget === name) {
        return (
          <div className="outline" style={{ marginTop: 4 }}>
            <div onClick={() => setToPM(item.user)}>{item.user}</div>
            <span style={{ color: item.whisper ? "violet" : "#FFF" }}>
              {item.whisper ? "*" : ""}
              {item.message}
              {item.whisper ? "*" : ""}
            </span>
          </div>
        );
      }
      return "";
    } else {
      return rollInstance(item, index);
    }
  };

  useEffect(() => {
    OBR.onReady(async () => {
      OBR.scene.onReadyChange(async (ready) => {
        if (ready) {
          const metadata = await OBR.scene.getMetadata();

          if (metadata["fist.extension/metadata"]) {
            const currentChat = await createChatArray(metadata);
            setChatToCheckChanges(currentChat);
          }

          setIsOBRReady(true);
          setTimeout(() => {
            var objDiv = document.getElementById("chatbox");
            if (objDiv) {
              objDiv.scrollTop = objDiv.scrollHeight;
            }
          }, 100);

          OBR.action.setBadgeBackgroundColor("orange");
          setName(await OBR.player.getName());
          setId(await OBR.player.getId());

          OBR.player.onChange(async (player) => {
            setName(await OBR.player.getName());
          });

          setRole(await OBR.player.getRole());
        } else {
          setIsOBRReady(false);
          setChat([]);
        }
      });

      if (await OBR.scene.isReady()) {
        const metadata = await OBR.scene.getMetadata();
        if (metadata["fist.extension/metadata"]) {
          const currentChat = await createChatArray(metadata);
          setChatToCheckChanges(currentChat);
        }

        setIsOBRReady(true);
        setTimeout(() => {
          var objDiv = document.getElementById("chatbox");
          if (objDiv) {
            objDiv.scrollTop = objDiv.scrollHeight;
          }
        }, 100);

        OBR.action.setBadgeBackgroundColor("orange");
        setName(await OBR.player.getName());
        setId(await OBR.player.getId());

        OBR.player.onChange(async (player) => {
          setName(await OBR.player.getName());
        });

        setRole(await OBR.player.getRole());
      }
    });

    try {
      localStorage.getItem("fist.extension/rolldata");
    } catch {
      setCookiesNotEnabled(true);
    }
  }, []);

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      addMessage();
    }
  };

  const createChatArray = async (metadata) => {
    const metadataGet = metadata["fist.extension/metadata"];
    let messages = [];
    const keys = Object.keys(metadataGet);

    const playerId = await OBR.player.getId();
    setId(playerId);

    keys.forEach((key) => {
      messages = messages.concat(metadataGet[key]);
      if (key === playerId) {
        setMyChat(metadataGet[key]);
      }
    });

    return messages.sort((a, b) => a.id - b.id);
  };

  useEffect(() => {
    if (chatToCheckChanges.length !== chat.length) {
      setChat(chatToCheckChanges);
      setTimeout(() => {
        var objDiv = document.getElementById("chatbox");
        if (objDiv) {
          objDiv.scrollTop = objDiv.scrollHeight;
        }
      }, 100);
    }
  }, [chatToCheckChanges]);

  useEffect(() => {
    if (isOBRReady) {
      OBR.scene.onMetadataChange(async (metadata) => {
        const currentChat = await createChatArray(metadata);
        setChatToCheckChanges(currentChat);
      });

      OBR.action.onOpenChange(async (isOpen) => {
        // React to the action opening or closing
        if (isOpen) {
          setUnreadCount(0);
          OBR.action.setBadgeText(undefined);
        }
      });

      try {
        localStorage.getItem("fist.extension/rolldata");
      } catch {
        setCookiesNotEnabled(true);
        return;
      }

      const stats = JSON.parse(localStorage.getItem("fist.extension/metadata"));

      if (stats) {
        setFRC(stats.FRC);
        setTAC(stats.TAC);
        setCRE(stats.CRE);
        setRFX(stats.RFX);
        setMOD(stats.MOD);
        setDiceCount(stats.diceCount);
      }
    }
  }, [isOBRReady]);

  useEffect(() => {
    const updateMessages = async () => {
      const lastMessage = chat[chat.length - 1];

      const isOpen = await OBR.action.isOpen();

      if (lastMessage && !cooldown && isOBRReady && !isOpen) {
        if (lastMessage.message) {
          if (!lastMessage.whisper || role === "GM") {
            OBR.notification.show(
              lastMessage.user +
                ": " +
                lastMessage.message +
                (lastMessage.whisper ? " (WHISPER)" : ""),
              "DEFAULT"
            );
          }
        } else if (lastMessage.result) {
          const isCrit = false;
          const isFumble = false;
          OBR.notification.show(
            lastMessage.user +
              " Rolled " +
              (isCrit
                ? "CRITICAL"
                : isFumble
                ? "FUMBLE"
                : lastMessage.diceOneResult +
                  lastMessage.diceTwoResult +
                  lastMessage.bonus) +
              (lastMessage.damage !== 0 &&
              lastMessage.damage !== "" &&
              !isFumble
                ? " DMG: " +
                  (lastMessage.useHR
                    ? HR + lastMessage.damage
                    : lastMessage.damage)
                : ""),
            isCrit ? "WARNING" : isFumble ? "ERROR" : "INFO"
          );
          setCoolDown(true);
        }
        if (isOBRReady) {
          const isOpen = await OBR.action.isOpen();
          if (!isOpen) {
            if (!lastMessage.whisper || role === "GM") {
              setUnreadCount(unreadCount + 1);
              OBR.action.setBadgeText("" + (unreadCount + 1));
            }
          }
        }
      }
      setTimeout(() => {
        setCoolDown(false);
      }, 4000);
    };

    if (isOBRReady) {
      updateMessages();
    }
  }, [chat]);

  function getSubstring(str, start, end) {
    const char1 = str.indexOf(start) + 1;
    const char2 = str.lastIndexOf(end);
    return str.substring(char1, char2);
  }

  const clearChat = async () => {
    const metadataGet = await OBR.scene.getMetadata();
    const metadata = metadataGet["fist.extension/metadata"];
    const keys = Object.keys(metadata);

    let clearedMetaData = { ...metadata };

    keys.forEach((key) => {
      clearedMetaData[key] = [];
    });

    OBR.scene.setMetadata({
      "fist.extension/metadata": clearedMetaData,
    });
  };

  const addMessage = async () => {
    if (text !== "") {
      if (role === "GM") {
        if (text.charAt(0) === "[") {
          const target = getSubstring(text, "[", "]");
          addWhisper(target);
          return;
        }

        if (text === "/clearchat") {
          clearChat();
          setText("");
          return;
        }
      }

      const newMessage = { id: Date.now(), user: name, message: text.trim() };
      const newChat = [...myChat, newMessage];

      const metadataGet = await OBR.scene.getMetadata();
      const metadata = metadataGet["fist.extension/metadata"];

      let metadataChange = { ...metadata };
      metadataChange[id] = newChat;

      OBR.scene.setMetadata({
        "fist.extension/metadata": metadataChange,
      });

      setText("");

      setTimeout(() => {
        var objDiv = document.getElementById("chatbox");
        if (objDiv) {
          objDiv.scrollTop = objDiv.scrollHeight;
        }
      }, 100);
    }
  };

  const addWhisper = async (target) => {
    if (text !== "") {
      const message = target ? text.replace("[" + target + "]", "") : text;

      const newMessage = {
        id: Date.now(),
        user: name,
        message: message.trim(),
        whisper: true,
        whisperTarget: target,
      };
      const newChat = [...myChat, newMessage];

      const metadataGet = await OBR.scene.getMetadata();
      const metadata = metadataGet["fist.extension/metadata"];

      let metadataChange = { ...metadata };
      metadataChange[id] = newChat;

      OBR.scene.setMetadata({
        "fist.extension/metadata": metadataChange,
      });

      setText("");

      setTimeout(() => {
        var objDiv = document.getElementById("chatbox");
        if (objDiv) {
          objDiv.scrollTop = objDiv.scrollHeight;
        }
      }, 100);
    }
  };

  const addRoll = async () => {
    const newMessage = {
      id: Date.now(),
      user: name,
    };
    const newChat = [...myChat, newMessage];

    const metadataGet = await OBR.scene.getMetadata();
    const metadata = metadataGet["fist.extension/metadata"];
    let metadataChange = { ...metadata };
    metadataChange[id] = newChat;

    OBR.scene.setMetadata({
      "fist.extension/metadata": metadataChange,
    });

    setTimeout(() => {
      var objDiv = document.getElementById("chatbox");
      if (objDiv) {
        objDiv.scrollTop = objDiv.scrollHeight;
      }
    }, 100);
  };

  const generateRandomNumber = (end) => {
    var range = end;
    var randomNum = Math.floor(Math.random() * range) + 1;

    return randomNum;
  };

  const saveStats = (replace) => {
    localStorage.setItem(
      "fist.extension/metadata",
      JSON.stringify({
        FRC,
        TAC,
        CRE,
        RFX,
        MOD,
        diceCount,
        ...replace,
      })
    );
  };

  const changeFRC = (evt) => {
    if (evt.target.value != "") {
      setFRC(parseInt(evt.target.value, ""));
      saveStats({ FRC: parseInt(evt.target.value) });
    } else {
      setFRC("");
      saveStats({ FRC: "" });
    }
  };
  const changeTAC = (evt) => {
    if (evt.target.value != "") {
      setTAC(parseInt(evt.target.value, ""));
      saveStats({ TAC: parseInt(evt.target.value) });
    } else {
      setTAC("");
      saveStats({ TAC: "" });
    }
  };
  const changeCRE = (evt) => {
    if (evt.target.value != "") {
      setCRE(parseInt(evt.target.value, ""));
      saveStats({ CRE: parseInt(evt.target.value) });
    } else {
      setCRE("");
      saveStats({ CRE: "" });
    }
  };
  const changeRFX = (evt) => {
    if (evt.target.value != "") {
      setRFX(parseInt(evt.target.value, ""));
      saveStats({ RFX: parseInt(evt.target.value) });
    } else {
      setRFX("");
      saveStats({ RFX: "" });
    }
  };

  const changeMOD = (evt) => {
    if (evt.target.value != "") {
      setMOD(parseInt(evt.target.value, ""));
      saveStats({ MOD: parseInt(evt.target.value) });
    } else {
      setMOD("");
      saveStats({ MOD: "" });
    }
  };

  const changeDiceCount = (evt) => {
    if (evt.target.value != "") {
      setDiceCount(parseInt(evt.target.value, ""));
      saveStats({ diceCount: parseInt(evt.target.value) });
    } else {
      setDiceCount("");
      saveStats({ diceCount: "" });
    }
  };

  if (cookiesNotEnabled) {
    return (
      <div
        style={{
          backgroundImage: `url(${landingBG})`,
          backgroundSize: "contain",
          height: 540,
          width: 400,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            paddingLeft: 25,
            paddingRight: 20,
            paddingTop: 40,
          }}
        >
          <div className="outline" style={{ color: "red", font: 14 }}>
            Error:
          </div>
          <div className="outline" style={{ fontSize: 14 }}>
            You need to enable 3rd Party cookies for this extention to work.
            This is because some chat data is stored in the browser localstorage
            that enables to cache some user data and settings.
          </div>
        </div>
      </div>
    );
  }

  if (!isOBRReady) {
    return (
      <div
        style={{
          backgroundImage: `url(${landingBG})`,
          backgroundSize: "contain",
          height: 540,
          width: 400,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            paddingLeft: 25,
            paddingRight: 20,
            paddingTop: 40,
          }}
        >
          <div className="outline" style={{ color: "red", font: 14 }}>
            No Scene found.
          </div>
          <div className="outline" style={{ fontSize: 14 }}>
            You need to load a scene to enable the chat and dice roller. If a
            scene is already loaded, kindly refresh the page.
          </div>
        </div>
      </div>
    );
  }

  const renderInfo = () => {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          paddingLeft: 15,
          paddingRight: 15,
          paddingTop: 15,
          alignItems: "center",
        }}
      >
        <span className="dice-result" style={{ marginRight: 4 }}>
          Codename:
        </span>
        <input
          className="input-stat"
          type="number"
          style={{
            width: 180,
            color: "lightred",
          }}
          value={MOD}
          onChange={changeMOD}
        />
        <button
          className="button-dice"
          style={{
            width: 130,
            marginRight: 0,
          }}
          onClick={() => {}}
        >
          Role / Traits /Inventory
        </button>
      </div>
    );
  };
  const renderStats = () => {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          paddingLeft: 15,
          paddingRight: 15,
          paddingTop: 4,
          alignItems: "center",
        }}
      >
        <input
          className="input-stat"
          type="number"
          style={{
            width: 20,
            color: "orange",
          }}
          value={FRC}
          onChange={changeFRC}
        />
        <button className="button-dice" onClick={() => {}}>
          Forceful
        </button>
        <input
          className="input-stat"
          type="number"
          style={{
            width: 20,
            color: "orange",
          }}
          value={TAC}
          onChange={changeTAC}
        />
        <button className="button-dice" onClick={() => {}}>
          Tactical
        </button>
        <input
          className="input-stat"
          type="number"
          style={{
            width: 20,
            color: "orange",
          }}
          value={CRE}
          onChange={changeCRE}
        />
        <button className="button-dice" onClick={() => {}}>
          Creative
        </button>

        <input
          className="input-stat"
          type="number"
          style={{
            width: 20,
            color: "orange",
          }}
          value={RFX}
          onChange={changeRFX}
        />
        <button className="button-dice" onClick={() => {}}>
          Reflex
        </button>
        <span className="dice-result" style={{ marginRight: 4 }}>
          Mod:
        </span>
        <input
          className="input-stat"
          type="number"
          style={{
            width: 20,
            color: "yellow",
            marginRight: 0,
          }}
          value={MOD}
          onChange={changeMOD}
        />
      </div>
    );
  };

  const renderDice = () => {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          paddingLeft: 15,
          paddingRight: 15,
          paddingTop: 4,
          alignItems: "center",
        }}
      >
        <span className="dice-result" style={{ marginRight: 4 }}>
          D6's
        </span>
        <input
          className="input-stat"
          type="number"
          style={{
            width: 20,
            color: "cyan",
          }}
          value={diceCount}
          onChange={changeDiceCount}
        />
        <span
          className="dice-result"
          style={{ marginRight: 4, whiteSpace: "nowrap" }}
        >
          + Damage:
        </span>
        <input
          className="input-stat"
          type="number"
          style={{
            width: 20,
            color: "red",
          }}
          value={diceCount}
          onChange={changeDiceCount}
        />
        <button
          className="button-dice"
          style={{
            width: 50,
          }}
          onClick={() => {}}
        >
          Attack
        </button>

        <span className="dice-result" style={{ marginRight: 4 }}>
          HP:
        </span>
        <input
          className="input-stat"
          type="number"
          style={{
            width: 20,
            color: "lightred",
          }}
          value={MOD}
          onChange={changeMOD}
        />
        <span className="dice-result" style={{ marginRight: 4 }}>
          Armor:
        </span>
        <input
          className="input-stat"
          type="number"
          style={{
            width: 20,
            color: "lightgrey",
          }}
          value={MOD}
          onChange={changeMOD}
        />
        <span className="dice-result" style={{ marginRight: 4 }}>
          Wardice:
        </span>
        <input
          className="input-stat"
          type="number"
          style={{
            width: 20,
            color: "yellow",
            marginRight: 0,
          }}
          value={MOD}
          onChange={changeMOD}
        />
      </div>
    );
  };

  return (
    <div
      style={{
        background: "#444",
        backgroundSize: "contain",
        height: 540,
        width: 400,
        overflow: "hidden",
      }}
    >
      {renderInfo()}
      {renderStats()}
      {renderDice()}
      <div
        style={{
          marginLeft: 15,
          marginRight: 15,
          marginTop: 10,
          height: "100%",
        }}
      >
        <div
          id="chatbox"
          className="scrollable-container"
          style={{
            backgroundColor: "#333",
            padding: 10,
            overflow: "scroll",
            height: 354,
            border: "1px solid #222",
          }}
        >
          {chat.length
            ? chat.map((item, index) => (
                <ChatInstance key={index} item={item} index={index} />
              ))
            : ""}
        </div>
        <div style={{ marginTop: 5, display: "flex", alignItems: "center" }}>
          <input
            id="chatbox"
            style={{
              color: "#FFF",
              width: 315,
              height: 24,
              marginRight: 2,
              paddingLeft: 4,
              backgroundColor: "#333",
              fontSize: 12,
              border: "1px solid #222",
              outline: "none",
            }}
            value={text}
            onChange={(evt) => {
              setText(evt.target.value);
            }}
            onKeyDown={handleKeyDown}
          ></input>
          <button
            style={{
              width: 48,
              height: 32,
              fontSize: 10,
              padding: 0,
              color: "#ffd433",
              backgroundColor: "#222",
              marginTop: -2,
            }}
            onClick={() => addWhisper()}
          >
            Whisper GM
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
