const $textMessageArea = document.querySelector('.text-sm')
const $bottomArea = document.querySelector('.bottom-0')
const $textarea = $bottomArea.querySelector('textarea')
const $submitBtn = $bottomArea.querySelector('textarea').parentElement.querySelector('button')
const channel = new BroadcastChannel('chatgpt-soliloquize')

function getTryAgainBtn() {
    const $btns = $bottomArea.querySelectorAll('button')
    return Array.from($btns).find($btn => $btn.innerText.includes('Try again'))
}

function isResultStreaming() {
    return $textMessageArea.querySelector('.result-streaming') !== null
}

function getTheLastMessage() {
    const childrenCount = $textMessageArea.childElementCount
    if (childrenCount < 2) {
        return {
            id: 0,
            text: '',
            isBot: false,
        }
    }

    const $lastMessage = $textMessageArea.children[childrenCount - 2]

    return {
        id: childrenCount - 2,
        text: $lastMessage.querySelector('.whitespace-pre-wrap').innerText,
        isBot: $lastMessage.classList.contains('bg-gray-50'),
    }
}

function sendMessage(text) {
    $textarea.value = text
    $submitBtn.click()
}

function onAnotherBotMessageReceived(event) {
    sendMessage(event.data)
}

let lastPostedMessageId = -1

function textMessageAreaObserverCallback(mutationsList, observer) {
    for (const mutation of mutationsList) {
        if (mutation.type === 'attributes') {
            if (isResultStreaming()) {
                continue
            }
            const lastMessage = getTheLastMessage()
            if (!lastMessage.isBot) {
                continue
            }
            if (lastMessage.id === lastPostedMessageId) {
                continue
            }
            if (lastMessage.text === '') {
                continue
            }
            lastPostedMessageId = lastMessage.id
            channel.postMessage(lastMessage.text)
        }
    }
}

const textMessageAreaObserver = new MutationObserver(textMessageAreaObserverCallback)

function attach() {
    channel.addEventListener('message', onAnotherBotMessageReceived)
    textMessageAreaObserver.observe($textMessageArea, { attributes: true, subtree: true, childList: true })
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
}

document.addEventListener('DOMContentLoaded', main)
