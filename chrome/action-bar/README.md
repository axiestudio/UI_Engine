# action-bar — UI preset
**Job:** keep the ONE mobile action (book/call/buy) in thumb's reach after the hero scrolls away. **Emotion:** calm competence — furniture, never a pop-up.
**Signature move:** the rise happens EXACTLY ONCE past `appearAfter` and never flickers back; it *retires* (tucks away) only when its own destination (`retirementId`, e.g. the booking section) arrives — it stops selling once someone's already converting.
**Details:** safe-area inset padding, backdrop-blur card, optional ghost side action + mono note, `lg:hidden` by default, aria-hidden + tabIndex guard when off-screen. Provenance: mp `in-view`/`magnetic` + wm `button`.
