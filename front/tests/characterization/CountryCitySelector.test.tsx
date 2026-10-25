import { useState } from "react"
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import CountryCitySelector, {
   emptyLocationSelection,
   type LocationSelection
} from "@/components/common/CountryCitySelector"

const { getCountries, useGetLocationCitiesQuery } = vi.hoisted(() => ({
   getCountries: vi.fn(),
   useGetLocationCitiesQuery: vi.fn()
}))

vi.mock("@countrystatecity/countries-browser", () => ({ getCountries }))
vi.mock("@/services/shared/locationApiCalls", () => ({
   useGetLocationCitiesQuery
}))

const places = [
   {
      geonameId: 170063,
      name: "Aleppo",
      asciiName: "Aleppo",
      countryCode: "SY",
      admin1Code: "09",
      admin1Name: "Aleppo",
      admin2Code: "",
      admin2Name: "",
      population: 2098210
   },
   {
      geonameId: 5368361,
      name: "Los Angeles",
      asciiName: "Los Angeles",
      countryCode: "US",
      admin1Code: "CA",
      admin1Name: "California",
      admin2Code: "",
      admin2Name: "Los Angeles County",
      population: 3792621
   }
]

const renderSelector = () => {
   const onChange = vi.fn()
   const SelectorHarness = () => {
      const [value, setValue] = useState<LocationSelection>(emptyLocationSelection)
      return (
         <CountryCitySelector
            required
            value={value}
            onChange={next => {
               onChange(next)
               setValue(next)
            }}
         />
      )
   }

   render(<SelectorHarness />)
   return { onChange }
}

const selectCountry = async (
   user: ReturnType<typeof userEvent.setup>,
   country: string
) => {
   await user.click(screen.getByRole("combobox", { name: "Country" }))
   await user.click(await screen.findByRole("option", { name: country }))
}

describe("CountryCitySelector GeoNames selection", () => {
   beforeEach(() => {
      getCountries.mockResolvedValue([
         { iso2: "SY", name: "Syria" },
         { iso2: "US", name: "United States" }
      ])
      useGetLocationCitiesQuery.mockImplementation(
         ({ countryCode, q }: { countryCode: string; q?: string }) => ({
            currentData: {
               data: places.filter(
                  city =>
                     city.countryCode === countryCode &&
                     (!q || city.name.toLowerCase().includes(q.toLowerCase()))
               )
            },
            isFetching: false,
            isError: false
         })
      )
   })

   it("shows searchable city suggestions from the backend dataset", async () => {
      const user = userEvent.setup()
      renderSelector()
      await selectCountry(user, "United States")

      const cityInput = screen.getByRole("combobox", { name: "City" })
      fireEvent.change(cityInput, { target: { value: "Los" } })
      expect(
         await screen.findByRole("option", { name: /Los Angeles/ })
      ).toBeVisible()
   })

   it("provides Syrian cities as validated selections instead of manual values", async () => {
      const user = userEvent.setup()
      const { onChange } = renderSelector()
      await selectCountry(user, "Syria")

      const cityInput = screen.getByRole("combobox", { name: "City" })
      fireEvent.change(cityInput, { target: { value: "Aleppo" } })
      await user.click(await screen.findByRole("option", { name: /Aleppo/ }))

      expect(cityInput).toHaveValue("Aleppo")
      expect(onChange).toHaveBeenLastCalledWith(
         expect.objectContaining({
            countryCode: "SY",
            cityName: "Aleppo",
            cityGeonameId: 170063
         })
      )
   })

   it("does not allow a typed city without selecting a dataset record", async () => {
      const user = userEvent.setup()
      const { onChange } = renderSelector()
      await selectCountry(user, "United States")

      const cityInput = screen.getByRole("combobox", { name: "City" })
      fireEvent.change(cityInput, { target: { value: "Unknown Place" } })
      expect(
         within(document.body).queryByRole("option", {
            name: /Add "Unknown Place"/
         })
      ).not.toBeInTheDocument()
      expect(onChange).not.toHaveBeenCalledWith(
         expect.objectContaining({ cityGeonameId: expect.any(Number) })
      )
   })

   it("clears the selected city when the country changes", async () => {
      const user = userEvent.setup()
      const { onChange } = renderSelector()
      await selectCountry(user, "United States")
      const cityInput = screen.getByRole("combobox", { name: "City" })
      fireEvent.change(cityInput, { target: { value: "Los" } })
      await user.click(await screen.findByRole("option", { name: /Los Angeles/ }))

      await selectCountry(user, "Syria")
      await waitFor(() => expect(cityInput).toHaveValue(""))
      expect(onChange).toHaveBeenLastCalledWith(
         expect.objectContaining({
            countryCode: "SY",
            cityName: "",
            cityGeonameId: null
         })
      )
   })

   it("keeps required selection empty until the user selects a city record", async () => {
      const user = userEvent.setup()
      renderSelector()
      await selectCountry(user, "Syria")

      const cityInput = screen.getByRole("combobox", { name: "City" })
      expect(cityInput).toBeEnabled()
      expect(cityInput).toBeRequired()
      fireEvent.change(cityInput, { target: { value: "" } })
      expect(cityInput).toHaveValue("")
   })
})
