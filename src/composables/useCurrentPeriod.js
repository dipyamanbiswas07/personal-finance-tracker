/**
 * After the 20th of the month, treat the "current" period as next month.
 * Handles Dec → Jan year rollover.
 */
const now = new Date()
const day = now.getDate()
const realMonth = now.getMonth() + 1
const realYear = now.getFullYear()

const isAfter20th = day > 20

export const currentMonth = isAfter20th ? (realMonth === 12 ? 1 : realMonth + 1) : realMonth
export const currentYear = isAfter20th && realMonth === 12 ? realYear + 1 : realYear
export const currentMonthName = new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long' })
