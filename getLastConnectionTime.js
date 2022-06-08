module.exports = function getLastConnectionTime(time) {
    const timeSecond = Math.round(time / 1000)
    if (timeSecond < 60) return timeSecond + " sec ago"
    else {
        const timeMinute = Math.round(timeSecond / 60)
        if (timeMinute < 60) return timeMinute + " min ago"
        else {
            const timeHours = Math.round(timeMinute / 60)
            if (timeHours < 24) return timeHours + " h ago"
            else {
                const days = Math.round(timeHours / 24)
                if (days < 30) return days + " days ago"
                else {
                    const months = Math.round(days / 30)
                    return months + " months ago"
                }
            }
        }
    }
}
