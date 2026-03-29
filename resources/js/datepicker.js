export default class Datepicker {
  #wrapper
  #picker
  #input
  #preventClose
  #inputStardDate
  #inputEndDate

  constructor(wrapper, value) {
    if (!Array.isArray(value) || (value.length !== 0 && value.length !== 2)) {
      throw new Error('Invalid value given to datepicker')
    }

    this.#wrapper = wrapper
    this.#picker = wrapper.querySelector('wc-datepicker')
    this.#input = wrapper.querySelector('.input-datepicker')
    this.#inputStardDate = wrapper.querySelector('.input-datepicker-startdate')
    this.#inputEndDate = wrapper.querySelector('.input-datepicker-enddate')
    this.#preventClose = false

    this.#bind(value)
  }

  static init(document) {
    document.addEventListener('DOMContentLoaded', () => {
      document.querySelectorAll('[data-datepicker]').forEach((wrapper) => {
        if (wrapper.dataset.initialized) return
        wrapper.dataset.initialized = 'true'

        const value = JSON.parse(wrapper.dataset.value || '[]')
        new Datepicker(wrapper, value)
      })
    })
  }

  #bind(value) {
    this.#picker.addEventListener('selectDate', ({ detail }) => {
      this.#input.value = detail
        ? `Entre le ${detail.map((date) => date.split('-').reverse().join('.')).join(' et le ')}`
        : ''

      if (detail.length === 2) {
        this.#inputStardDate.value = detail[0]
        this.#inputEndDate.value = detail[1]
        this.#inputStardDate.removeAttribute('disabled')
        this.#inputEndDate.removeAttribute('disabled')
      } else {
        this.#inputStardDate.setAttribute('disabled', 'disabled')
        this.#inputEndDate.setAttribute('disabled', 'disabled')
      }
    })

    this.#input.addEventListener('focus', () => {
      this.#input.value = ''
      this.#inputStardDate.value = ''
      this.#inputEndDate.value = ''
      this.#inputStardDate.setAttribute('disabled', 'disabled')
      this.#inputEndDate.setAttribute('disabled', 'disabled')
      this.#openPicker()
    })

    document.addEventListener('mousedown', (e) => {
      if (this.#preventClose) {
        this.#preventClose = false
        return
      }
      if (!this.#wrapper.contains(e.target)) this.#closePicker()
    })

    if (value.length === 2) {
      this.#input.value = value
        ? `Entre le ${value.map((date) => date.split('-').reverse().join('.')).join(' et le ')}`
        : ''
      this.#inputStardDate.value = value[0]
      this.#inputEndDate.value = value[1]
      this.#inputStardDate.removeAttribute('disabled')
      this.#inputEndDate.removeAttribute('disabled')
    } else {
      this.#inputStardDate.setAttribute('disabled', 'disabled')
      this.#inputEndDate.setAttribute('disabled', 'disabled')
    }
  }

  #openPicker() {
    this.#picker.style.visibility = 'visible'
  }

  #closePicker() {
    this.#picker.style.visibility = 'hidden'
  }
}
