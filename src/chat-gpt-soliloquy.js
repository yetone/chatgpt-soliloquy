const $textMessageArea = document.querySelector('.text-sm')
const $bottomArea = document.querySelector('.bottom-0')
const $textarea = $bottomArea.querySelector('textarea')
const $submitBtn = $bottomArea.querySelector('textarea').parentElement.querySelector('button')
const channel = new BroadcastChannel('chatgpt-soliloquize')

function getTheLastMessage() {
    const childrenCount = $textMessageArea.childElementCount
    if (childrenCount < 2) {
        return {
            id: 0,
            text: '',
            isBot: false,
            isTyping: false,
        }
    }

    const $lastMessage = $textMessageArea.children[childrenCount - 2]

    return {
        id: childrenCount - 2,
        text: $lastMessage.querySelector('.whitespace-pre-wrap').innerText,
        isBot: $lastMessage.classList.contains('bg-gray-50'),
        isTyping: $lastMessage.querySelector('.result-streaming') !== null
    }
}

let clearTextTimer = null

function sendMessage(eventData) {
    if (clearTextTimer) {
        clearTimeout(clearTextTimer)
    }
    if (eventData.isTyping) {
        $textarea.value = eventData.text
        $textarea.dispatchEvent(new Event('input', { bubbles: true }))
    } else {
        $textarea.value = eventData.text
        $textarea.dispatchEvent(new Event('input', { bubbles: true }))
        $submitBtn.click()
        clearTextTimer = setTimeout(() => {
            $textarea.value = ''
            $textarea.dispatchEvent(new Event('input', { bubbles: true }))
        }, 500)
    }
}

function onAnotherBotMessageReceived(event) {
    sendMessage(event.data)
}

function textMessageAreaObserverCallback(mutationsList, observer) {
    for (const mutation of mutationsList) {
        const lastMessage = getTheLastMessage()
        if (!lastMessage.isBot) {
            continue
        }
        if (lastMessage.text === '') {
            continue
        }
        channel.postMessage({
            isTyping: lastMessage.isTyping,
            text: lastMessage.text
        })
    }
}

const textMessageAreaObserver = new MutationObserver(textMessageAreaObserverCallback)

function attach() {
    channel.addEventListener('message', onAnotherBotMessageReceived)
    textMessageAreaObserver.observe($textMessageArea, { characterData: true, attributes: true, subtree: true, childList: true })
}

function detach() {
    channel.removeEventListener('message', onAnotherBotMessageReceived)
    textMessageAreaObserver.disconnect()
}

function main() {
    const $checkBox = document.createElement('input')
    $checkBox.type = 'checkbox'
    $checkBox.id = 'chatgpt-soliloquize'
    $checkBox.checked = false
    $checkBox.addEventListener('change', (event) => {
        if (event.target.checked) {
            attach()
        } else {
            detach()
        }
    })
    const $label = document.createElement('label')
    $label.htmlFor = 'chatgpt-soliloquize'
    $label.innerText = 'Soliloquize'
    const $container = document.createElement('div')
    $container.style = 'display: flex; flex-direction: row; align-items: center; gap: 0.5rem; padding: 0px; margin-right: 30px'
    $container.className = 'absolute p-1 rounded-md text-gray-500 bottom-1.5 right-1 md:bottom-2.5 md:right-2 hover:bg-gray-100 dark:hover:text-gray-400 dark:hover:bg-gray-900 disabled:hover:bg-transparent dark:disabled:hover:bg-transparent'
    $container.appendChild($checkBox)
    $container.appendChild($label)
    $textarea.parentElement.appendChild($container)
    $textarea.style = 'padding-right: 150px'
}

main()
