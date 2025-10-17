import KapaAlertDialog from 'src/components/KapaAlertDialog.vue';
export default {
    install(app) {
        console.log("kapaAlert plugin registered");

        // Registrar la función global $kapaAlert
        app.config.globalProperties.$kapaAlert = (options) => {
            const icon = options.type === 'error' ? 'cancel' : options.type === 'success' ? 'check_circle' : 'announcement';
            const color = options.type === 'error' ? 'negative' : options.type === 'success' ? 'positive' : 'warning';
            const defaultTitle = options.type === 'error' ? 'Error' : options.type === 'success' ? 'Éxito' : 'Aviso';
            const title = options.title || defaultTitle;
            app.config.globalProperties.$q.dialog({
                component: KapaAlertDialog,
                componentProps: {
                    title: title,
                    message: options.message || '',
                    icon: icon,
                    color: color,
                    showCancel: options.showCancel || false
                }
            }).onOk(() => {
                console.log('OK')
            }).onCancel(() => {
                console.log('Cancel')
            }).onDismiss(() => {
                console.log('Called on OK or Cancel')
            });
        };
    }
};
