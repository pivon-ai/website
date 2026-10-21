/**
 * Kopieren-Knöpfe im Kontaktblock: legen E-Mail-Adresse oder Telefonnummer
 * in die Zwischenablage – hilfreich, wenn kein E-Mail-Programm eingerichtet
 * ist. Ohne Zwischenablage (alter Browser, kein HTTPS) bleiben die Knöpfe
 * ausgeblendet, die Links funktionieren weiter.
 */
// Klassisches Skript (kein ES-Modul), Laden mit defer.

;(function () {
  'use strict'

  if (!navigator.clipboard || !navigator.clipboard.writeText) return

  document.querySelectorAll('[data-copy]').forEach((knopf) => {
    const text = knopf.querySelector('.pv-copy__text')
    const normal = text.textContent
    let timer
    knopf.hidden = false
    knopf.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(knopf.dataset.copy)
      } catch {
        return
      }
      knopf.dataset.kopiert = ''
      text.textContent = knopf.dataset.copyDone
      clearTimeout(timer)
      timer = setTimeout(() => {
        delete knopf.dataset.kopiert
        text.textContent = normal
      }, 1800)
    })
  })
})()
