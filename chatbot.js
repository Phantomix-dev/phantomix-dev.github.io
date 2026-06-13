/* ==========================================
   PHANTOMIX AI ASSISTANT
   Production Version
========================================== */

const chatToggle =
document.getElementById("phantomix-chat-toggle");

const chatWindow =
document.getElementById("phantomix-chat");

const closeBtn =
document.getElementById("phantomix-close");

const sendBtn =
document.getElementById("phantomix-send");

const input =
document.getElementById("phantomix-input");

const messagesContainer =
document.getElementById("phantomix-messages");

/* ==========================================
   CHANGE THIS LATER
========================================== */

const API_URL =
"https://YOUR-CLOUDFLARE-WORKER.workers.dev";

/* ==========================================
   OPEN / CLOSE CHAT
========================================== */

chatToggle.addEventListener("click", () => {
    chatWindow.classList.add("active");
});

closeBtn.addEventListener("click", () => {
    chatWindow.classList.remove("active");
});

/* ==========================================
   SAVE HISTORY
========================================== */

function saveHistory() {

    localStorage.setItem(
        "phantomix-chat-history",
        messagesContainer.innerHTML
    );
}

function loadHistory() {

    const saved =
    localStorage.getItem(
        "phantomix-chat-history"
    );

    if(saved){
        messagesContainer.innerHTML = saved;
    }
}

loadHistory();

/* ==========================================
   TIMESTAMP
========================================== */

function getTime(){

    const now = new Date();

    return now.toLocaleTimeString([],{
        hour:"2-digit",
        minute:"2-digit"
    });
}

/* ==========================================
   ADD MESSAGE
========================================== */

function addMessage(
    text,
    sender
){

    const msg =
    document.createElement("div");

    msg.className =
    sender === "user"
    ? "message user-message"
    : "message bot-message";

    msg.innerHTML = `
        ${text}
        <div class="message-time">
            ${getTime()}
        </div>
    `;

    messagesContainer.appendChild(msg);

    messagesContainer.scrollTop =
    messagesContainer.scrollHeight;

    saveHistory();
}

/* ==========================================
   TYPING INDICATOR
========================================== */

function showTyping(){

    const typing =
    document.createElement("div");

    typing.className =
    "message bot-message";

    typing.id = "typing-indicator";

    typing.innerHTML = `
        <div class="typing">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;

    messagesContainer.appendChild(
        typing
    );

    messagesContainer.scrollTop =
    messagesContainer.scrollHeight;
}

function removeTyping(){

    const typing =
    document.getElementById(
        "typing-indicator"
    );

    if(typing){
        typing.remove();
    }
}

/* ==========================================
   SEND MESSAGE
========================================== */

async function sendMessage(){

    const userMessage =
    input.value.trim();

    if(!userMessage) return;

    addMessage(
        userMessage,
        "user"
    );

    input.value = "";

    showTyping();

    try{

        const response =
        await fetch(API_URL,{

            method:"POST",

            headers:{
                "Content-Type":
                "application/json"
            },

            body:JSON.stringify({

                message:userMessage,

                systemPrompt:
                PHANTOMIX_CONTEXT
            })
        });

        const data =
        await response.json();

        removeTyping();

        addMessage(
            data.reply ||
            "Sorry, I couldn't respond.",
            "bot"
        );

    }catch(error){

        console.error(error);

        removeTyping();

        addMessage(
            "Connection error. Please try again later.",
            "bot"
        );
    }
}

/* ==========================================
   SEND BUTTON
========================================== */

sendBtn.addEventListener(
    "click",
    sendMessage
);

/* ==========================================
   ENTER KEY
========================================== */

input.addEventListener(
    "keydown",
    function(e){

        if(e.key === "Enter"){

            e.preventDefault();

            sendMessage();
        }
    }
);

/* ==========================================
   WELCOME MESSAGE
========================================== */

if(
!localStorage.getItem(
"phantomix-first-visit"
)
){

addMessage(
"👋 Welcome to Phantomix AI. How can I help you today?",
"bot"
);

localStorage.setItem(
"phantomix-first-visit",
"true"
);

}