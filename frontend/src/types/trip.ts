export type Trip = {
  id: string
  name: string
  destinationCity: string
  destinationCountry: string
  startDate: string
  endDate: string
  currency: string
  weeklyBudgetCents: number
  createdAt: string
  updatedAt: string
}
export type CreateTripInput = {
  name: string
  destinationCity: string
  destinationCountry: string
  startDate: string
  endDate: string
  currency: string
  weeklyBudgetCents: number
}
