# Global Language and Billing Experience

## Language behavior

BMR AI CHATBOART now stores one language preference per signed-in user. Users can select **Automatic**, English, and major Indian languages including Telugu, Hindi, Marathi, Tamil, Kannada, Malayalam, Bengali, Gujarati, Punjabi, and Urdu, alongside several widely used international languages. Automatic asks the model to answer in the language of the user’s latest message; a selected language gives the model a persistent response-language instruction for future conversations.

The profile language choice is also passed to browser speech input and playback as a standard BCP 47 locale, such as `te-IN` for Telugu, `hi-IN` for Hindi, or `mr-IN` for Marathi. The Web Speech API separates speech recognition from speech synthesis, and its recognition `lang` property accepts BCP 47 language tags.[1] [2] Speech synthesis is broadly available, but the installed device voices determine whether a natural voice exists for a given language.[3]

> **User experience rule:** If browser dictation is unavailable, microphone permission is denied, or a matching device voice is absent, BMR keeps typed chat available and clearly explains the fallback. It does not pretend that every browser or device has every language voice.

## Test multilingual behavior

Sign in, open the profile section, choose **తెలుగు / Telugu**, **हिन्दी / Hindi**, or **मराठी / Marathi**, then send a normal message in that language. The assistant should use the selected language in text. Use the microphone button to dictate when the browser supports recognition for the chosen locale, and use **Play voice** on an assistant response to request speech in that locale. Voice quality and availability vary by device, browser, operating system, and installed voices.

## Subscription management

The profile shows the current BMR plan. Free users see an upgrade action. After a Stripe Checkout completion webhook records the minimal Stripe customer ID, Pro users see **Manage or cancel plan**. This opens a short-lived, Stripe-hosted billing portal in a new tab. Stripe keeps payment methods, invoices, subscription state, and cancellation workflows as the billing source of truth; BMR stores only the Stripe customer reference needed to create a portal session.

Before launch, configure the Stripe customer portal separately in both sandbox and live modes. Enable subscription cancellation, payment-method updates, invoice history, and any permitted upgrade or downgrade product catalog in **Stripe Dashboard → Settings → Billing → Customer portal**. Stripe documents that portal sessions are short-lived and should be created on demand for an authenticated customer.[4] It also supports configuring customer cancellation behavior in the portal.[5]

## References

[1] [MDN, Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)

[2] [MDN, SpeechRecognition: lang property](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/lang)

[3] [MDN, SpeechSynthesis](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis)

[4] [Stripe, Integrate the customer portal with the API](https://docs.stripe.com/customer-management/integrate-customer-portal)

[5] [Stripe, Add a cancellation page to the customer portal](https://docs.stripe.com/customer-management/cancellation-page)
