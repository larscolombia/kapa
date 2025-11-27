/**
 * Configuración de pruebas E2E para ILV
 * 
 * IMPORTANTE: Actualiza las credenciales antes de ejecutar los tests
 */

export const TEST_CONFIG = {
    // Credenciales de usuario de prueba
    // Debe tener rol de Admin KAPA o Usuario KAPA para crear reportes
    user: {
        email: 'admin@admin.com', // Usuario admin con password actualizada para E2E
        password: 'E2ETest123' // Password específica para testing E2E
    },

    // URLs de la aplicación
    urls: {
        base: 'https://kapa.healtheworld.com.co',
        login: '/login',
        ilvReportes: '/ilv/reportes',
        ilvNuevoReporte: '/ilv/reportes/nuevo'
    },

    // Timeouts (en milisegundos)
    timeouts: {
        navigation: 10000,
        networkIdle: 5000,
        fieldWait: 500,
        masterLoad: 1500
    },

    // Selectores personalizados si la app los necesita
    selectors: {
        emailInput: 'input[aria-label="Usuario"]',
        passwordInput: 'input[aria-label="Contraseña"]',
        submitButton: 'button:has-text("Ingresar")',
        successNotification: '.q-notification--positive',
        errorNotification: '.q-notification--negative'
    }
};
