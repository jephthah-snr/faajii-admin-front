export const disableLogsInProduction = () => {
  if (process.env.NODE_ENV === 'production') {
    console.log = () => {} // Disable console.log
    console.warn = () => {} // Disable console.warn
    console.error = () => {} // Disable console.error
  }
}
