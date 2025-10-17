import { boot } from 'quasar/wrappers';
import kapaAlert from 'src/plugins/kapaAlert';
import { VueReCaptcha } from 'vue-recaptcha-v3'

export default boot(({ app }) => {
    app.use(kapaAlert);
    app.use(VueReCaptcha, { siteKey: import.meta.env.VITE_RECAPTCHA_SITE_KEY });
});