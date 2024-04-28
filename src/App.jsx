/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import OBR from "@owlbear-rodeo/sdk";
import landingBG from "./assets/bg.jpg";
import refresh from "./assets/refresh.png";
import "./App.css";
import traitsList from "./traits.json";
import rolesList from "./roles.json";

//missions
import mission_generator from "./matrices/mission_generator.json";
import mission_prompts from "./matrices/mission_prompts.json";
//characters
import animals from "./matrices/characters/animals.json";
import anomalies from "./matrices/characters/anomalies.json";
import celebrities from "./matrices/characters/celebrities.json";
import civilians from "./matrices/characters/civilians.json";
import experiments from "./matrices/characters/experiments.json";
import monsters from "./matrices/characters/monsters.json";
import politicians from "./matrices/characters/politicians.json";
import robots from "./matrices/characters/robots.json";
import scientists from "./matrices/characters/scientists.json";
import soldiers from "./matrices/characters/soldiers.json";
import spies from "./matrices/characters/spies.json";
import squads from "./matrices/characters/squads.json";
//Cyclops
import gadgets from "./matrices/cyclops/gadgets.json";
import rumors from "./matrices/cyclops/rumors.json";
//Factions
import agencies from "./matrices/factions/agencies.json";
import aliens from "./matrices/factions/aliens.json";
import corporations from "./matrices/factions/corporations.json";
import criminals from "./matrices/factions/criminals.json";
import cults from "./matrices/factions/cults.json";
import insurgents from "./matrices/factions/insurgents.json";
//Gears
import base_upgrades from "./matrices/gear/base_upgrades.json";
import gear_items from "./matrices/gear/items.json";
import vehicles from "./matrices/gear/vehicles.json";
import weapons_and_armor from "./matrices/gear/weapons_and_armor.json";
import standard_issue from "./matrices/gear/standard_issue.json";
//locations
import battlefields from "./matrices/locations/battlefields.json";
import cities from "./matrices/locations/cities.json";
import nature from "./matrices/locations/nature.json";
import rooms from "./matrices/locations/rooms.json";
import structures from "./matrices/locations/structures.json";
import zones from "./matrices/locations/zones.json";
//lore
import artifacts from "./matrices/lore/artifacts.json";
import coverups from "./matrices/lore/coverups.json";
import diplomacy from "./matrices/lore/diplomacy.json";
import disasters from "./matrices/lore/disasters.json";
import legends from "./matrices/lore/legends.json";
import spells from "./matrices/lore/spells.json";
//world
import hazards from "./matrices/world/hazards.json";
//cassettes
import cassettes from "./matrices/cassettes.json";
//misc
import misc from "./matrices/misc.json";
import combat from "./matrices/combat.json";
import partials from "./matrices/partials.json";
import choke_scores from "./matrices/choke_scores.json";

const Text = (props) => {
  const { children } = props;
  return <span className="outline">{children}</span>;
};

const AGENT = () => {
  return {
    id: Date.now(),
    details: {
      codename: "",
      role: 0,
    },
    attributes: {
      FRC: 0,
      TAC: 0,
      CRE: 0,
      RFX: 0,
    },
    stats: {
      hp: 6,
      maxHP: 6,
      armor: 0,
      wardice: 0,
    },
    traits: [],
    items: [],
    dead: false,
  };
};

function App() {
  const [diceCount, setDiceCount] = useState(1);
  const [diceChance, setDiceChance] = useState(1);
  const [text, setText] = useState("");
  const [isOBRReady, setIsOBRReady] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedTrait, setSelectedTrait] = useState(111);
  const [name, setName] = useState("");
  const [id, setId] = useState("");
  const [role, setRole] = useState("PLAYER");
  const [chat, setChat] = useState([]);
  const [chatToCheckChanges, setChatToCheckChanges] = useState([]);
  const [myChat, setMyChat] = useState([]);
  const [cookiesNotEnabled, setCookiesNotEnabled] = useState(false);
  const [player, setPlayer] = useState(null);
  const [timeoutID, setTimeoutID] = useState(null);
  const [tab, setTab] = useState("playerList");
  const [playerList, setPlayerList] = useState([]);
  const [gmScreen, setGMScreen] = useState(false);
  const [selectedGenerator, setSelectedGenerator] = useState("");
  const [generatorResult, setGeneratorResult] = useState("");
  const [matrixName, setMatrixName] = useState("");

  useEffect(() => {
    var objDiv = document.getElementById("chatbox");
    if (objDiv) {
      objDiv.scrollTop = objDiv.scrollHeight;
    }
  }, [tab]);

  const createPlayerList = async (metadata) => {
    const metadataGet = metadata["fist.character.extension/metadata"];
    const playerListGet = [];
    const keys = Object.keys(metadataGet);
    keys.forEach((key) => {
      playerListGet.push(metadataGet[key]);
    });
    return playerListGet;
  };

  const updatePlayer = (playerGet) => {
    if (!timeoutID) {
      const myTimeout = setTimeout(() => {
        savePlayer();
      }, 500);
      setTimeoutID(myTimeout);
    } else {
      clearTimeout(timeoutID);
      const myTimeout = setTimeout(() => {
        savePlayer();
      }, 500);
      setTimeoutID(myTimeout);
    }
    setPlayer(playerGet);
  };

  const savePlayer = async () => {
    if (player) {
      const metadataData = await OBR.scene.getMetadata();
      const metadata = metadataData["fist.character.extension/metadata"];
      let metadataChange = { ...metadata };
      metadataChange[player.id] = { ...player, lastEdit: id };

      OBR.scene.setMetadata({
        "fist.character.extension/metadata": metadataChange,
      });
      setTimeoutID(null);
    }
  };

  const removePlayer = async (id) => {
    const metadataData = await OBR.scene.getMetadata();
    const metadata = metadataData["fist.character.extension/metadata"];
    let metadataChange = { ...metadata };

    if (confirm("Are you sure you want to delete the character?") == true) {
      delete metadataChange[id];

      OBR.scene.setMetadata({
        "fist.character.extension/metadata": metadataChange,
      });
    }
  };

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

  function nextBiggest(arr) {
    let max = -Infinity,
      result = -Infinity;

    for (const value of arr) {
      const nr = Number(value);

      if (nr > max) {
        [result, max] = [max, nr]; // save previous max
      } else if (nr < max && nr > result) {
        result = nr; // new second biggest
      }
    }

    return result;
  }

  const rollInstance = (item, index) => {
    if (item.generated) {
      return (
        <div
          className="roll-detail"
          style={{ textAlign: "center", backgroundColor: "#222" }}
        >
          <div style={{ fontSize: 13, color: "darkorange" }}>
            {item.matrixName}
          </div>
          {item.generated.map((detail, index) => (
            <div key={index}>
              <span style={{ color: "cyan", marginLeft: 3 }}>
                {detail.title}
              </span>
              :
              <span style={{ color: "lightgreen", marginLeft: 3 }}>
                {detail.detail}
              </span>
            </div>
          ))}
        </div>
      );
    }

    if (item.chance) {
      return (
        <div className="roll-detail" style={{ textAlign: "center" }}>
          <span>
            {item.codename} rolled a
            <span style={{ color: "cyan" }}>{" " + item.result + " "}</span>on a
            <span style={{ color: "magenta" }}>{" " + item.chance + " "}</span>
            of 6 chance.
            {parseInt(item.result) <= parseInt(item.chance) && (
              <span style={{ color: "lightgreen", marginLeft: 3 }}>
                It happens!
              </span>
            )}
            {parseInt(item.result) > parseInt(item.chance) && (
              <span style={{ color: "red", marginLeft: 3 }}>
                It didn't happen.
              </span>
            )}
          </span>
        </div>
      );
    }

    let total = 0;
    if (item.results && item.results.length) {
      total = item.results.reduce((total, num) => {
        return total + num;
      });
    }
    if (item.bonus) total += item.bonus;
    return (
      <div className="roll-detail" style={{ textAlign: "center" }}>
        <span>
          {item.codename} rolled{item.stat ? " " + item.stat : ""}:
          {item.results?.map((item, index) => {
            if (index === 0) {
              return (
                <span style={{ color: "#438D80" }} key={index}>
                  {" " + item}
                </span>
              );
            }
            return (
              <span style={{ marginLeft: 3 }} key={index}>
                + <span style={{ color: "#438D80" }}>{item}</span>
              </span>
            );
          })}
          {item.bonus ? (
            <span style={{ marginLeft: 3 }}>
              +{" "}
              <span style={{ color: item.bonus > 0 ? "lightgreen" : "red" }}>
                {item.bonus}
              </span>
            </span>
          ) : (
            ""
          )}
          {item.results.length > 1 && (
            <span style={{ marginLeft: 3 }}>
              = <span style={{ color: "lightblue" }}>{total}</span>
            </span>
          )}
          {item.stat ? (
            <span>
              {item.results[0] === 6 && item.results[1] === 6 ? (
                <span
                  style={{ color: "#FF4500", marginLeft: 3 }}
                  className={index > chat.length - 8 ? "crit" : ""}
                >
                  ULTRA SUCCESS
                </span>
              ) : total > 9 ? (
                <span style={{ color: "lightgreen", marginLeft: 3 }}>
                  SUCCESS
                </span>
              ) : total > 6 ? (
                <span style={{ color: "orange", marginLeft: 3 }}>
                  PARTIAL SUCCESS
                </span>
              ) : (
                <span style={{ color: "brown", marginLeft: 3 }}>FAILURE</span>
              )}
            </span>
          ) : (
            ""
          )}
          {item.results.length === 3 && (
            <span style={{ marginLeft: 3 }}>
              Best Two:{" "}
              <span style={{ color: "lightgreen", marginRight: 3 }}>
                {Math.max(...item.results) + nextBiggest(item.results)}
              </span>
              Worst Two:{" "}
              <span style={{ color: "red" }}>
                {Math.min(...item.results) + nextBiggest(item.results)}
              </span>
            </span>
          )}
        </span>
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

    if (item.title) {
      return (
        <div style={{ marginTop: 4 }}>
          <div className="outline">
            <div onClick={() => setToPM(item.user)}>{item.user}</div>
          </div>
          <div className="roll-detail">
            <div style={{ fontSize: 13, color: "darkorange" }}>
              {item.title}
            </div>
            <hr
              style={{
                marginTop: 4,
                marginBottom: 4,
                borderColor: "grey",
                backgroundColor: "grey",
                color: "grey",
              }}
            ></hr>
            <div>{item.description}</div>
          </div>
        </div>
      );
    }

    if (item.message || imageURL) {
      if (item.message.charAt(0) === "=") {
        const mathToEvaluate = item.message.substring(1, item.message.length);
        return (
          <div className="outline" style={{ marginTop: 4 }}>
            <div onClick={() => setToPM(item.user)}>{item.user}</div>
            <span style={{ color: "#D2691E" }}>
              {mathToEvaluate + " = " + evaluateMath(mathToEvaluate)}
            </span>
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

          if (metadata["fist.character.extension/metadata"]) {
            const playerListGet = await createPlayerList(metadata);
            setPlayerList(playerListGet);
          }

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

        if (metadata["fist.character.extension/metadata"]) {
          const playerListGet = await createPlayerList(metadata);
          setPlayerList(playerListGet);
        }

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

    const playerId = await OBR.player.getId();
    setId(playerId);

    if (metadataGet) {
      const keys = Object.keys(metadataGet);

      keys.forEach((key) => {
        messages = messages.concat(metadataGet[key]);
        if (key === playerId) {
          setMyChat(metadataGet[key]);
        }
      });
    }

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

        const playerListGet = await createPlayerList(metadata);
        setPlayerList(playerListGet);
      });

      OBR.action.onOpenChange(async (isOpen) => {
        // React to the action opening or closing
        if (isOpen && tab === "chat") {
          setUnreadCount(0);
        }
      });

      try {
        localStorage.getItem("fist.extension/rolldata");
      } catch {
        setCookiesNotEnabled(true);
        return;
      }
    }
  }, [isOBRReady]);

  useEffect(() => {
    if (unreadCount > 0) {
      OBR.action.setBadgeText("" + unreadCount);
    } else OBR.action.setBadgeText(undefined);
  }, [unreadCount]);

  useEffect(() => {
    const updateMessages = async () => {
      const lastMessage = chat[chat.length - 1];

      if (lastMessage && isOBRReady) {
        if (isOBRReady) {
          const isOpen = await OBR.action.isOpen();
          if (!isOpen || tab !== "chat") {
            if (!lastMessage.whisper || role === "GM") {
              setUnreadCount(unreadCount + 1);
            }
          }
        }
      }
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

  const addDescription = async (title, description) => {
    const newMessage = { id: Date.now(), user: name, title, description };
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

  const addRoll = async (diceCount, bonus, stat) => {
    const results = [];

    for (let i = 0; i < diceCount; i++) {
      results.push(generateRandomNumber(6));
    }

    const newMessage = {
      id: Date.now(),
      user: name,
      codename: player ? player.details.codename : "GM",
      results,
      bonus,
      stat,
    };
    const newChat = [...myChat, newMessage];

    const metadataGet = await OBR.scene.getMetadata();
    const metadata = metadataGet["fist.extension/metadata"];
    let metadataChange = { ...metadata };
    metadataChange[id] = newChat;

    OBR.scene.setMetadata({
      "fist.extension/metadata": metadataChange,
    });
    setTab("chat");
    setUnreadCount(0);

    setTimeout(() => {
      var objDiv = document.getElementById("chatbox");
      if (objDiv) {
        objDiv.scrollTop = objDiv.scrollHeight;
      }
    }, 100);
  };

  const addChanceRoll = async (chance) => {
    const newMessage = {
      id: Date.now(),
      user: name,
      codename: player ? player.details.codename : "GM",
      result: generateRandomNumber(6),
      chance,
    };
    const newChat = [...myChat, newMessage];

    const metadataGet = await OBR.scene.getMetadata();
    const metadata = metadataGet["fist.extension/metadata"];
    let metadataChange = { ...metadata };
    metadataChange[id] = newChat;

    OBR.scene.setMetadata({
      "fist.extension/metadata": metadataChange,
    });
    setTab("chat");
    setUnreadCount(0);

    setTimeout(() => {
      var objDiv = document.getElementById("chatbox");
      if (objDiv) {
        objDiv.scrollTop = objDiv.scrollHeight;
      }
    }, 100);
  };

  const addGeneratedResult = async (item) => {
    const generated = generatorResult.map((item) => {
      return { title: item.Title, detail: item.Values[item.index] };
    });

    const newMessage = {
      id: Date.now(),
      user: name,
      matrixName,
      generated: item
        ? [{ title: item.Title, detail: item.Values[item.index] }]
        : generated,
    };
    const newChat = [...myChat, newMessage];

    const metadataGet = await OBR.scene.getMetadata();
    const metadata = metadataGet["fist.extension/metadata"];
    let metadataChange = { ...metadata };
    metadataChange[id] = newChat;

    OBR.scene.setMetadata({
      "fist.extension/metadata": metadataChange,
    });
    setTab("chat");
    setUnreadCount(0);

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

  const changeFRC = (evt) => {
    const playerGet = { ...player };
    if (evt.target.value != "") {
      playerGet.attributes.FRC = parseInt(evt.target.value, "");
    } else {
      playerGet.attributes.FRC = "";
    }
    updatePlayer(playerGet);
  };
  const changeTAC = (evt) => {
    const playerGet = { ...player };
    if (evt.target.value != "") {
      playerGet.attributes.TAC = parseInt(evt.target.value, "");
    } else {
      playerGet.attributes.TAC = "";
    }
    updatePlayer(playerGet);
  };
  const changeCRE = (evt) => {
    const playerGet = { ...player };
    if (evt.target.value != "") {
      playerGet.attributes.CRE = parseInt(evt.target.value, "");
    } else {
      playerGet.attributes.CRE = "";
    }
    updatePlayer(playerGet);
  };
  const changeRFX = (evt) => {
    const playerGet = { ...player };
    if (evt.target.value != "") {
      playerGet.attributes.RFX = parseInt(evt.target.value, "");
    } else {
      playerGet.attributes.RFX = "";
    }
    updatePlayer(playerGet);
  };

  const changeDiceCount = (evt) => {
    if (evt.target.value != "") {
      setDiceCount(parseInt(evt.target.value, ""));
    } else {
      setDiceCount("");
    }
  };

  const changeDiceChance = (evt) => {
    if (evt.target.value != "") {
      const value = parseInt(evt.target.value, "");
      setDiceChance(value < 7 ? value : 6);
    } else {
      setDiceChance("");
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

  const playerItem = (data, index) => {
    return (
      <div key={index}>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 5,
            marginTop: 5,
          }}
        >
          <Text>Codename: </Text>
          <span
            className="outline"
            style={{
              display: "inline-block",
              fontSize: 12,
              color: "orange",
              width: 150,
              textAlign: "center",
              padding: 4,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {data.details.codename}
          </span>
          <Text>HP:</Text>
          <input
            className="input-stat"
            style={{
              width: 20,
              color: "Red",
            }}
            readOnly={true}
            value={data.stats.hp}
          />
          <Text>Wardice: </Text>
          <input
            className="input-stat"
            style={{
              width: 20,
              color: "yellow",
            }}
            readOnly={true}
            value={data.stats.wardice}
          />
          <button
            className="button"
            style={{
              width: 96,
              padding: 5,
              marginRight: 4,
              marginLeft: "auto",
            }}
            onClick={() => {
              setPlayer(data);
              setTab("chat");
              setUnreadCount(0);
            }}
          >
            Open
          </button>
          <button
            className="button"
            style={{
              fontWeight: "bolder",
              width: 25,
              color: "darkred",
            }}
            onClick={() => {
              removePlayer(data.id);
            }}
          >
            ✖
          </button>
        </div>
        <hr />
      </div>
    );
  };

  const addPlayer = async () => {
    const playerGet = AGENT();
    const metadataData = await OBR.scene.getMetadata();
    const metadata = metadataData["fist.character.extension/metadata"];
    let metadataChange = { ...metadata };
    metadataChange[playerGet.id] = playerGet;

    OBR.scene.setMetadata({
      "fist.character.extension/metadata": metadataChange,
    });
  };

  const renderPlayerList = () => {
    return (
      <div
        className="scrollable-container"
        style={{
          backgroundColor: "#444",
          padding: 20,
          overflow: "scroll",
          height: 540,
          border: "1px solid #222",
        }}
      >
        <div className="outline" style={{ fontSize: 14, color: "lightgrey" }}>
          FIST - Freelance Infantry Strike Team
        </div>
        <hr></hr>
        {playerList.map((item, index) => {
          return playerItem(item, index);
        })}
        <button
          className="button"
          style={{ fontWeight: "bolder", width: 80, float: "right" }}
          onClick={() => {
            addPlayer();
          }}
        >
          Add Character
        </button>
        <button
          className="button"
          style={{
            fontWeight: "bolder",
            width: 100,
            float: "right",
            marginRight: 4,
          }}
          onClick={() => {
            setGMScreen(true);
            setTab("chat");
            setUnreadCount(0);
          }}
        >
          Open GM Section
        </button>
      </div>
    );
  };

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
        <span className="outline" style={{ marginRight: 4, fontSize: 11 }}>
          Codename:
        </span>
        <input
          className="input-stat"
          style={{
            width: 140,
            color: "lightred",
          }}
          value={player.details.codename}
          onChange={(evt) => {
            const playerGet = { ...player };
            playerGet.details.codename = evt.target.value;
            updatePlayer(playerGet);
          }}
        />
        <button
          className="button-dice"
          style={{
            width: 130,
            marginRight: 4,
          }}
          onClick={() => {
            if (tab === "chat") setTab("details");
            else {
              setTab("chat");
              setUnreadCount(0);
            }
          }}
        >
          {tab === "chat" ? "Role / Traits /Inventory" : "Chat "}
          {tab !== "chat" && (
            <span style={{ color: "red" }}>
              {unreadCount ? `(${unreadCount})` : ""}
            </span>
          )}
        </button>
        <button
          className="button-dice"
          style={{
            width: 35,
            color: "red",
            marginRight: 0,
          }}
          onClick={() => {
            setPlayer(null);
            setTab("playerList");
          }}
        >
          Close
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
          value={player.attributes.FRC}
          onChange={changeFRC}
        />
        <button
          className="button-dice"
          onClick={() => {
            addRoll(2, player.attributes.FRC, "Forceful");
          }}
        >
          Forceful
        </button>
        <input
          className="input-stat"
          type="number"
          style={{
            width: 20,
            color: "orange",
          }}
          value={player.attributes.TAC}
          onChange={changeTAC}
        />
        <button
          className="button-dice"
          onClick={() => {
            addRoll(2, player.attributes.TAC, "Tactical");
          }}
        >
          Tactical
        </button>
        <input
          className="input-stat"
          type="number"
          style={{
            width: 20,
            color: "orange",
          }}
          value={player.attributes.CRE}
          onChange={changeCRE}
        />
        <button
          className="button-dice"
          onClick={() => {
            addRoll(2, player.attributes.CRE, "Creative");
          }}
        >
          Creative
        </button>

        <input
          className="input-stat"
          type="number"
          style={{
            width: 20,
            color: "orange",
          }}
          value={player.attributes.RFX}
          onChange={changeRFX}
        />
        <button
          className="button-dice"
          style={{ marginRight: 0 }}
          onClick={() => {
            addRoll(2, player.attributes.RFX, "Reflexive");
          }}
        >
          Reflexive
        </button>
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
        <button
          className="button-dice"
          style={{
            width: 80,
          }}
          onClick={() => {
            addRoll(diceCount);
          }}
        >
          Roll D6's
        </button>

        <span className="dice-result" style={{ marginRight: 4 }}>
          HP:
        </span>
        <input
          className="input-stat"
          type="number"
          style={{
            width: 20,
            color: "red",
          }}
          value={player.stats.hp}
          onChange={(evt) => {
            const playerGet = { ...player };
            playerGet.stats.hp = evt.target.value;
            updatePlayer(playerGet);
          }}
        />
        <span
          className="dice-result"
          style={{ marginRight: 4, whiteSpace: "nowrap" }}
        >
          Max HP:
        </span>
        <input
          className="input-stat"
          type="number"
          style={{
            width: 20,
            color: "firebrick",
          }}
          value={player.stats.maxHP}
          onChange={(evt) => {
            const playerGet = { ...player };
            playerGet.stats.maxHP = evt.target.value;
            updatePlayer(playerGet);
          }}
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
          value={player.stats.armor}
          onChange={(evt) => {
            const playerGet = { ...player };
            playerGet.stats.armor = evt.target.value;
            updatePlayer(playerGet);
          }}
        />
        <span className="dice-result" style={{ marginRight: 4 }}>
          Wardice:
        </span>
        <input
          className="input-stat"
          type="number"
          style={{
            width: 20,
            color: "lightgreen",
            marginRight: 0,
          }}
          value={player.stats.wardice}
          onChange={(evt) => {
            const playerGet = { ...player };
            playerGet.stats.wardice = evt.target.value;
            updatePlayer(playerGet);
          }}
        />
      </div>
    );
  };

  const item = (item, index, traitItem) => {
    return (
      <div
        key={index}
        style={{ display: "flex", alignItems: "center", marginBottom: 4 }}
      >
        <input
          className="input-stat"
          style={{
            width: 340,
            color: "lightgrey",
          }}
          value={item}
          placeholder="Item and description"
          onChange={(evt) => {
            const playerGet = { ...player };
            playerGet.items[index] = evt.target.value;
            updatePlayer(playerGet);
          }}
          readOnly={traitItem}
        />
        <button
          className="button"
          style={{ width: 40, marginRight: 4 }}
          onClick={() => {
            addDescription(item);
            setTab("chat");
            setUnreadCount(0);
          }}
        >
          Show
        </button>
        {!traitItem && (
          <button
            className="button"
            style={{ width: 25, color: "darkred" }}
            onClick={() => {
              if (
                confirm("Are you sure you want to delete the item?") == true
              ) {
                const playerGet = { ...player };
                playerGet.items.splice(index, 1);
                updatePlayer(playerGet);
              }
            }}
          >
            ✖
          </button>
        )}
      </div>
    );
  };

  const trait = (trait, index) => {
    return (
      <div key={index}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div className="outline">({trait.Number})</div>
          <div
            className="outline"
            style={{
              width: 120,
              textAlign: "center",
              borderBottom: "1px solid #222",
              fontSize: 12,
              marginRight: 4,
              color: "orange",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "inline-block",
              paddingLeft: 4,
              minHeight: 18,
            }}
          >
            {trait.Name}
          </div>
          <div
            className="outline"
            style={{
              color: "lightblue",
              marginLeft: "auto",
              marginRight: "auto",
              fontSize: 11,
            }}
          >
            ({trait.Stat})
          </div>
          <button
            className="button"
            style={{ marginRight: 4, width: 40, marginLeft: "auto" }}
            onClick={() => {
              addDescription(trait.Name + ` (${trait.Number})`, trait.Effect);
              setTab("chat");
              setUnreadCount(0);
            }}
          >
            Show
          </button>
          <button
            className="button"
            style={{ width: 25, color: "darkred" }}
            onClick={() => {
              if (
                confirm("Are you sure you want to delete the trait?") == true
              ) {
                const playerGet = { ...player };
                playerGet.traits.splice(index, 1);
                updatePlayer(playerGet);
              }
            }}
          >
            ✖
          </button>
        </div>

        <div
          className="outline"
          style={{
            fontSize: 11,
            borderRadius: 4,
            background: "#333",
            padding: 10,
            marginTop: 4,
            marginBottom: 4,
            color: "lightgrey",
          }}
        >
          {trait.Effect}
        </div>
      </div>
    );
  };

  const playerRole = () => {
    return (
      <div>
        <hr />
        <div style={{ display: "flex", alignItems: "center" }}>
          <Text>Role: </Text>
          <select
            autocomplete="on"
            style={{
              backgroundColor: "#333",
              color: "orange",
              fontSize: 12,
              padding: 1,
              borderRadius: 3,
              border: "1px solid #222",
              marginRight: 4,
            }}
            value={player.details.role}
            onChange={(evt) => {
              const playerGet = { ...player };
              playerGet.details.role = parseInt(evt.target.value);
              updatePlayer(playerGet);
            }}
          >
            {rolesList.map((item, index) => {
              return (
                <option key={index} value={item.Number} title={item.Text}>
                  {item.Name} ({item.Number})
                </option>
              );
            })}
          </select>
          <button
            className="button"
            style={{ width: 40, marginLeft: "auto" }}
            onClick={() => {
              addDescription(
                getRoleByNumber(player.details.role).Name +
                  ` (${player.details.role})`,
                getRoleByNumber(player.details.role).Text
              );
              setTab("chat");
              setUnreadCount(0);
            }}
          >
            Show
          </button>
        </div>

        {player.details.role !== 0 && (
          <div
            className="outline"
            style={{
              fontSize: 11,
              borderRadius: 4,
              background: "#333",
              padding: 10,
              marginTop: 4,
              marginBottom: 4,
              color: "lightgrey",
            }}
          >
            {getRoleByNumber(player.details.role).Text}
          </div>
        )}
      </div>
    );
  };

  const getTraitByNumber = (number) => {
    return traitsList.find((item) => item.Number === number);
  };

  const getRoleByNumber = (number) => {
    return rolesList.find((item) => item.Number === number);
  };

  const renderTraits = () => {
    return (
      <>
        <div
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <Text>Traits:</Text>
          <select
            autocomplete="on"
            style={{
              backgroundColor: "#333",
              color: "orange",
              fontSize: 12,
              padding: 1,
              borderRadius: 3,
              border: "1px solid #222",
              marginRight: 4,
              marginLeft: "auto",
            }}
            value={selectedTrait}
            onChange={(evt) => {
              setSelectedTrait(parseInt(evt.target.value));
            }}
          >
            {traitsList.map((item, index) => {
              return (
                <option key={index} value={item.Number} title={item.Effect}>
                  {item.Name} ({item.Number})
                </option>
              );
            })}
          </select>
          <button
            className="button"
            style={{
              fontWeight: "bolder",
              width: 70,
              marginTop: 2,
            }}
            onClick={() => {
              const playerGet = { ...player };
              playerGet.traits.push(selectedTrait);
              updatePlayer(playerGet);
            }}
          >
            Add Trait
          </button>
        </div>
        <hr></hr>
        {player.traits.map((item, index) => {
          return trait(getTraitByNumber(item), index);
        })}
      </>
    );
  };

  const renderItems = () => {
    return (
      <div style={{ marginBottom: "1em" }}>
        <div
          className="outline"
          style={{ marginTop: "1em", display: "flex", alignItems: "center" }}
        >
          Inventory:
          <button
            className="button"
            style={{
              fontWeight: "bolder",
              width: 70,
              marginTop: 2,
              marginLeft: "auto",
            }}
            onClick={() => {
              const playerGet = { ...player };
              playerGet.items.push("");
              updatePlayer(playerGet);
            }}
          >
            Add Item
          </button>
        </div>
        <hr />

        <div className="outline" style={{ color: "lightgrey" }}>
          Trait Items:
        </div>
        {player.traits.map((data, index) => {
          return item(getTraitByNumber(data).Item, index, true);
        })}
        {player.items.length ? (
          <div
            className="outline"
            style={{ color: "lightgrey", marginTop: "1em" }}
          >
            Looted/Other Items:
          </div>
        ) : (
          ""
        )}
        {player.items.map((data, index) => {
          return item(data, index, false);
        })}
      </div>
    );
  };

  const renderDetails = () => {
    return (
      <div
        className="scrollable-container"
        style={{
          marginLeft: 15,
          marginRight: 15,
          marginTop: 10,
          overflow: "scroll",
          height: 410,
        }}
      >
        {renderTraits()}
        {renderItems()}
        {playerRole()}
      </div>
    );
  };

  const renderChat = () => {
    return (
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
            ? chat
                .sort((a, b) => a.id - b.id)
                .map((item, index) => (
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
    );
  };

  const getRandomIndexFromArray = (array) => {
    const index = Math.floor(Math.random() * array.length);
    return index;
  };

  const renderGenerators = () => {
    return (
      <div
        style={{
          marginLeft: 15,
          marginRight: 15,
          marginTop: 15,
        }}
      >
        <div>
          <span
            className="dice-result"
            style={{ marginRight: 4, marginTop: 4 }}
          >
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
          <button
            className="button-dice"
            style={{
              width: 60,
            }}
            onClick={() => {
              addRoll(diceCount);
            }}
          >
            Roll D6's
          </button>
          <span
            className="dice-result"
            style={{ marginRight: 4, marginTop: 4 }}
          >
            Chance:
          </span>
          <input
            className="input-stat"
            type="number"
            style={{
              width: 20,
              color: "magenta",
            }}
            value={diceChance}
            onChange={changeDiceChance}
          />
          <button
            className="button-dice"
            style={{
              width: 60,
            }}
            onClick={() => {
              addChanceRoll(diceChance);
            }}
          >
            {diceChance} out of 6
          </button>
          {selectedGenerator !== "" && (
            <button
              className="button-generator"
              style={{ color: "orange" }}
              onClick={() => {
                setSelectedGenerator("");
                setTab("chat");
                setUnreadCount(0);
                setMatrixName("");
              }}
            >
              Reset
            </button>
          )}
          <button
            className="button-dice"
            style={{
              width: 35,
              color: "red",
              marginRight: 0,
              marginLeft: "auto",
              float: "right",
            }}
            onClick={() => {
              setPlayer(null);
              setTab("playerList");
              setGMScreen(false);
            }}
          >
            Close
          </button>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              marginTop: 4,
            }}
          >
            {selectedGenerator === "" && (
              <>
                <button
                  className="button-generator"
                  onClick={() => {
                    setSelectedGenerator("characters");
                  }}
                >
                  Characters
                </button>
                <button
                  className="button-generator"
                  onClick={() => {
                    setSelectedGenerator("cyclops");
                  }}
                >
                  Cyclops
                </button>
                <button
                  className="button-generator"
                  onClick={() => {
                    setSelectedGenerator("factions");
                  }}
                >
                  Factions
                </button>
                <button
                  className="button-generator"
                  onClick={() => {
                    setSelectedGenerator("gear");
                  }}
                >
                  Gear
                </button>
                <button
                  className="button-generator"
                  onClick={() => {
                    setSelectedGenerator("locations");
                  }}
                >
                  Locations
                </button>
                <button
                  className="button-generator"
                  onClick={() => {
                    setSelectedGenerator("lore");
                  }}
                >
                  Lore
                </button>
                <button
                  className="button-generator"
                  onClick={() => {
                    setSelectedGenerator("actions");
                  }}
                >
                  Actions
                </button>
                <button
                  className="button-generator"
                  onClick={() => {
                    setSelectedGenerator("misc");
                    setGeneratorResult(generator(misc));
                    setMatrixName("Misc");
                    setTab("details");
                  }}
                >
                  Misc
                </button>
                <button
                  className="button-generator"
                  onClick={() => {
                    setSelectedGenerator("missions");
                  }}
                >
                  Mission
                </button>
                <button
                  className="button-generator"
                  onClick={() => {
                    setSelectedGenerator("traits/roles");
                  }}
                >
                  Traits/Roles
                </button>
              </>
            )}
            {/* characters */}
            {selectedGenerator === "characters" && (
              <>
                <button
                  className="button-generator"
                  style={{ width: 70 }}
                  onClick={() => {
                    setGeneratorResult(generator(animals));
                    setTab("details");
                    setMatrixName("Animals");
                  }}
                >
                  Animals
                </button>
                <button
                  className="button-generator"
                  style={{ width: 70 }}
                  onClick={() => {
                    setGeneratorResult(generator(celebrities));
                    setTab("details");
                    setMatrixName("Celebrities");
                  }}
                >
                  Celebrities
                </button>
                <button
                  className="button-generator"
                  style={{ width: 70 }}
                  onClick={() => {
                    setGeneratorResult(generator(civilians));
                    setTab("details");
                    setMatrixName("Civilians");
                  }}
                >
                  Civilians
                </button>
                <button
                  className="button-generator"
                  style={{ width: 70 }}
                  onClick={() => {
                    setGeneratorResult(generator(experiments));
                    setTab("details");
                    setMatrixName("Experiments");
                  }}
                >
                  Experiments
                </button>
                <button
                  className="button-generator"
                  style={{ width: 70 }}
                  onClick={() => {
                    setGeneratorResult(generator(monsters));
                    setTab("details");
                    setMatrixName("Monsters");
                  }}
                >
                  Monsters
                </button>
                <button
                  className="button-generator"
                  style={{ width: 70 }}
                  onClick={() => {
                    setGeneratorResult(generator(politicians));
                    setTab("details");
                    setMatrixName("Politicians");
                  }}
                >
                  Politicians
                </button>
                <button
                  className="button-generator"
                  style={{ width: 70 }}
                  onClick={() => {
                    setGeneratorResult(generator(robots));
                    setTab("details");
                    setMatrixName("Robots");
                  }}
                >
                  Robots
                </button>
                <button
                  className="button-generator"
                  style={{ width: 70 }}
                  onClick={() => {
                    setGeneratorResult(generator(scientists));
                    setTab("details");
                    setMatrixName("Scientists");
                  }}
                >
                  Scientists
                </button>
                <button
                  className="button-generator"
                  style={{ width: 70 }}
                  onClick={() => {
                    setGeneratorResult(generator(soldiers));
                    setTab("details");
                    setMatrixName("Soldiers");
                  }}
                >
                  Soldiers
                </button>
                <button
                  className="button-generator"
                  style={{ width: 70 }}
                  onClick={() => {
                    setGeneratorResult(generator(spies));
                    setTab("details");
                    setMatrixName("Spies");
                  }}
                >
                  Spies
                </button>
              </>
            )}
            {/* Cyclops */}
            {selectedGenerator === "cyclops" && (
              <>
                <button
                  className="button-generator"
                  style={{ width: 100 }}
                  onClick={() => {
                    setGeneratorResult(generator(gadgets));
                    setMatrixName("Cyclops Gadgets");
                    setTab("details");
                  }}
                >
                  Cyclops Gadgets
                </button>
                <button
                  className="button-generator"
                  style={{ width: 100 }}
                  onClick={() => {
                    setGeneratorResult(generator(rumors));
                    setMatrixName("Cyclops Rumors");
                    setTab("details");
                  }}
                >
                  Cyclops Rumors
                </button>
              </>
            )}
            {/* Factions */}
            {selectedGenerator === "factions" && (
              <>
                <button
                  className="button-generator"
                  style={{ width: 70 }}
                  onClick={() => {
                    setGeneratorResult(generator(agencies));
                    setMatrixName("Agencies");
                    setTab("details");
                  }}
                >
                  Agencies
                </button>
                <button
                  className="button-generator"
                  style={{ width: 70 }}
                  onClick={() => {
                    setGeneratorResult(generator(aliens));
                    setMatrixName("Aliens");
                    setTab("details");
                  }}
                >
                  Aliens
                </button>
                <button
                  className="button-generator"
                  style={{ width: 70 }}
                  onClick={() => {
                    setGeneratorResult(generator(corporations));
                    setMatrixName("Corporations");
                    setTab("details");
                  }}
                >
                  Corporation
                </button>
                <button
                  className="button-generator"
                  style={{ width: 70 }}
                  onClick={() => {
                    setGeneratorResult(generator(criminals));
                    setMatrixName("Criminals");
                    setTab("details");
                  }}
                >
                  Criminals
                </button>
                <button
                  className="button-generator"
                  style={{ width: 70 }}
                  onClick={() => {
                    setGeneratorResult(generator(cults));
                    setMatrixName("Cults");
                    setTab("details");
                  }}
                >
                  Cults
                </button>
                <button
                  className="button-generator"
                  style={{ width: 70 }}
                  onClick={() => {
                    setGeneratorResult(generator(insurgents));
                    setMatrixName("Insurgents");
                    setTab("details");
                  }}
                >
                  Insurgents
                </button>
                <button
                  className="button-generator"
                  style={{ width: 70 }}
                  onClick={() => {
                    setGeneratorResult(generator(squads));
                    setTab("details");
                    setMatrixName("Squads");
                  }}
                >
                  Squads
                </button>
              </>
            )}
            {/* Gear */}
            {selectedGenerator === "gear" && (
              <>
                <button
                  className="button-generator"
                  style={{ width: 100 }}
                  onClick={() => {
                    setGeneratorResult(generator(base_upgrades));
                    setMatrixName("Base Upgrades");
                    setTab("details");
                  }}
                >
                  Base Upgrades
                </button>
                <button
                  className="button-generator"
                  style={{ width: 100 }}
                  onClick={() => {
                    setGeneratorResult(generator(gear_items));
                    setMatrixName("Gear Items");
                    setTab("details");
                  }}
                >
                  Gear Items
                </button>
                <button
                  className="button-generator"
                  style={{ width: 100 }}
                  onClick={() => {
                    setGeneratorResult(generator(vehicles));
                    setMatrixName("Vehicles");
                    setTab("details");
                  }}
                >
                  Vehicles
                </button>
                <button
                  className="button-generator"
                  style={{ width: 100 }}
                  onClick={() => {
                    setGeneratorResult(generator(weapons_and_armor));
                    setMatrixName("Weapon and Armor");
                    setTab("details");
                  }}
                >
                  Weapon and Armor
                </button>
                <button
                  className="button-generator"
                  style={{ width: 100 }}
                  onClick={() => {
                    setGeneratorResult(generator(cassettes));
                    setMatrixName("Cassettes");
                    setTab("details");
                  }}
                >
                  Cassettes
                </button>
                <button
                  className="button-generator"
                  style={{ width: 100 }}
                  onClick={() => {
                    setGeneratorResult(generator(standard_issue));
                    setMatrixName("Standard Issue Items");
                    setTab("details");
                  }}
                >
                  Standard Issue
                </button>
              </>
            )}
            {/* Lore */}
            {selectedGenerator === "lore" && (
              <>
                <button
                  className="button-generator"
                  style={{ width: 70 }}
                  onClick={() => {
                    setGeneratorResult(generator(anomalies));
                    setTab("details");
                    setMatrixName("Anomalies");
                  }}
                >
                  Anomalies
                </button>
                <button
                  className="button-generator"
                  style={{ width: 70 }}
                  onClick={() => {
                    setGeneratorResult(generator(artifacts));
                    setMatrixName("Artifacts");
                    setTab("details");
                  }}
                >
                  Artifacts
                </button>
                <button
                  className="button-generator"
                  style={{ width: 70 }}
                  onClick={() => {
                    setGeneratorResult(generator(coverups));
                    setMatrixName("Cover-ups");
                    setTab("details");
                  }}
                >
                  Cover-ups
                </button>
                <button
                  className="button-generator"
                  style={{ width: 70 }}
                  onClick={() => {
                    setGeneratorResult(generator(diplomacy));
                    setMatrixName("Diplomacy");
                    setTab("details");
                  }}
                >
                  Diplomacy
                </button>
                <button
                  className="button-generator"
                  style={{ width: 70 }}
                  onClick={() => {
                    setGeneratorResult(generator(disasters));
                    setMatrixName("Disasters");
                    setTab("details");
                  }}
                >
                  Disasters
                </button>
                <button
                  className="button-generator"
                  style={{ width: 70 }}
                  onClick={() => {
                    setGeneratorResult(generator(legends));
                    setMatrixName("Legends");
                    setTab("details");
                  }}
                >
                  Legends
                </button>
                <button
                  className="button-generator"
                  style={{ width: 70 }}
                  onClick={() => {
                    setGeneratorResult(generator(spells));
                    setMatrixName("Zones");
                    setTab("details");
                  }}
                >
                  Spells
                </button>
              </>
            )}
            {/* Locations */}
            {selectedGenerator === "locations" && (
              <>
                <button
                  className="button-generator"
                  style={{ width: 70 }}
                  onClick={() => {
                    setGeneratorResult(generator(battlefields));
                    setMatrixName("Battlefields");
                    setTab("details");
                  }}
                >
                  Battlefields
                </button>
                <button
                  className="button-generator"
                  style={{ width: 70 }}
                  onClick={() => {
                    setGeneratorResult(generator(cities));
                    setMatrixName("Cities");
                    setTab("details");
                  }}
                >
                  Cities
                </button>
                <button
                  className="button-generator"
                  style={{ width: 70 }}
                  onClick={() => {
                    setGeneratorResult(generator(nature));
                    setMatrixName("Nature");
                    setTab("details");
                  }}
                >
                  Nature
                </button>
                <button
                  className="button-generator"
                  style={{ width: 70 }}
                  onClick={() => {
                    setGeneratorResult(generator(rooms));
                    setMatrixName("Rooms");
                    setTab("details");
                  }}
                >
                  Rooms
                </button>
                <button
                  className="button-generator"
                  style={{ width: 70 }}
                  onClick={() => {
                    setGeneratorResult(generator(structures));
                    setMatrixName("Structures");
                    setTab("details");
                  }}
                >
                  Structures
                </button>
                <button
                  className="button-generator"
                  style={{ width: 70 }}
                  onClick={() => {
                    setGeneratorResult(generator(zones));
                    setMatrixName("Zones");
                    setTab("details");
                  }}
                >
                  Zones
                </button>
                <button
                  className="button-generator"
                  style={{ width: 70 }}
                  onClick={() => {
                    setGeneratorResult(generator(hazards));
                    setMatrixName("Hazards");
                    setTab("details");
                  }}
                >
                  Hazards
                </button>
              </>
            )}
            {/* Missions */}
            {selectedGenerator === "missions" && (
              <>
                <button
                  className="button-generator"
                  style={{ width: 100 }}
                  onClick={() => {
                    setGeneratorResult(generator(mission_prompts));
                    setMatrixName("Mission Prompts");
                    setTab("details");
                  }}
                >
                  Mission Prompts
                </button>
                <button
                  className="button-generator"
                  style={{ width: 100 }}
                  onClick={() => {
                    setGeneratorResult(generator(mission_generator));
                    setMatrixName("Mission Generator");
                    setTab("details");
                  }}
                >
                  Mission Generator
                </button>
              </>
            )}
            {selectedGenerator === "actions" && (
              <>
                <button
                  className="button-generator"
                  style={{ width: 100 }}
                  onClick={() => {
                    setGeneratorResult(generator(partials));
                    setMatrixName("Partial Success");
                    setTab("details");
                  }}
                >
                  Partial Success
                </button>
                <button
                  className="button-generator"
                  style={{ width: 100 }}
                  onClick={() => {
                    setGeneratorResult(generator(combat));
                    setMatrixName("Combat Actions");
                    setTab("details");
                  }}
                >
                  Combat Actions
                </button>
                <button
                  className="button-generator"
                  style={{ width: 100 }}
                  onClick={() => {
                    setGeneratorResult(generator(choke_scores));
                    setMatrixName("Choke Scores");
                    setTab("details");
                  }}
                >
                  Choke Scores
                </button>
              </>
            )}
            {selectedGenerator === "traits/roles" && (
              <>
                <button
                  className="button-generator"
                  style={{ width: 100 }}
                  onClick={() => {
                    const traits = traitsList.map((item) => {
                      return `(${item.Number}) ${item.Name} - ${item.Effect} ITEM: ${item.Item} (${item.Stat}) `;
                    });
                    setGeneratorResult(
                      generator([{ Title: "Trait", Values: [...traits] }])
                    );
                    setMatrixName("Traits");
                    setTab("details");
                  }}
                >
                  Traits
                </button>
                <button
                  className="button-generator"
                  style={{ width: 100 }}
                  onClick={() => {
                    const roles = rolesList.map((item) => {
                      return `(${item.Number}) ${item.Name} - ${item.Text}`;
                    });
                    setGeneratorResult(
                      generator([{ Title: "Role", Values: [...roles] }])
                    );
                    setMatrixName("Roles");
                    setTab("details");
                  }}
                >
                  Roles
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const generator = (table) => {
    return table.map((item, index) => {
      item.index = getRandomIndexFromArray(item.Values);
      return item;
    });
  };

  const renderGenerator = (generator) => {
    return generator.map((item, index) => {
      return (
        <>
          <div
            key={index}
            className="outline"
            style={{ display: "flex", alignItems: "center" }}
          >
            <div>
              <button
                className="button-dice"
                style={{
                  backgroundImage: `url(${refresh})`,
                  backgroundSize: "contain",
                  width: 28,
                  height: 20,
                  margin: 5,
                }}
                onClick={() => {
                  const newGenerator = [...generator];
                  newGenerator[index].index = getRandomIndexFromArray(
                    item.Values
                  );
                  setGeneratorResult(newGenerator);
                }}
              />
            </div>
            <div>
              {item.Title}: {item.Values[item.index]}
            </div>
            <div style={{ marginLeft: "auto" }}>
              <button
                className="button-generator"
                style={{ color: "orange", width: 40 }}
                onClick={() => {
                  addGeneratedResult(item);
                }}
              >
                Show
              </button>
            </div>
          </div>
          <hr></hr>
        </>
      );
    });
  };

  const renderGeneratorResult = () => {
    return (
      <div
        style={{
          marginLeft: 15,
          marginRight: 15,
          marginTop: 15,
        }}
      >
        <hr></hr>
        {renderGenerator(generatorResult)}
        <button
          className="button-generator"
          style={{ color: "orange", float: "right" }}
          onClick={() => {
            addGeneratedResult();
          }}
        >
          Show All
        </button>
      </div>
    );
  };

  return (
    <div
      style={{
        background: "#444",
        height: 540,
        width: 400,
        overflow: "hidden",
      }}
    >
      {!gmScreen && tab === "playerList" && renderPlayerList()}
      {!gmScreen && tab !== "playerList" && renderInfo()}
      {!gmScreen && tab !== "playerList" && renderDice()}
      {!gmScreen && tab !== "playerList" && renderStats()}
      {gmScreen && renderGenerators()}
      {gmScreen && tab === "details" && renderGeneratorResult()}
      {tab === "chat" && renderChat()}
      {!gmScreen && tab === "details" && renderDetails()}
    </div>
  );
}

export default App;
