export const getNextDate = (date: string): Date => {
    const currentDate = new Date(date);
    const nextDate: Date = new Date(date);
    nextDate.setDate(currentDate.getDate() + 1);

    return nextDate;
};
