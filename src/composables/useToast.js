import { ref } from 'vue'

const toasts = ref([])

let nextId = 0

function push(type, message) {
  const id = ++nextId
  toasts.value.push({ id, type, message })
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }, 3500)
}

export function useToast() {
  return {
    toasts,
    toast: {
      success: (message) => push('success', message),
      error:   (message) => push('error',   message),
      warning: (message) => push('warning', message),
    },
  }
}
