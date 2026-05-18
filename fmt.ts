export const fmtPhone = (phone: string): string => {
    return phone.replace(/^(\d{3})(\d{4})(\d{4})/, "$1 $2 $3")
}
