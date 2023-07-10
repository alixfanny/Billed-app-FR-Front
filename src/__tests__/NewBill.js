/**
 * @jest-environment jsdom
 */

import {screen, fireEvent} from "@testing-library/dom"
import userEvent from "@testing-library/user-event"
import NewBill from "../containers/NewBill.js"
import NewBillUI from "../views/NewBillUI.js"
import BillsUI from "../views/BillsUI.js"
import mockStore from "../__mocks__/store"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js"
import { Router } from "express"


jest.mock("../app/store", () => mockStore)

document.body.innerHTML = NewBillUI()

describe("Given I am a user connected as Employee", () => {
  describe("je suis sur la page NewBill", () => {
    beforeEach(() =>{
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock
      })
      window.localStorage.setItem("user", JSON.stringify({
        type: "employee",
        email: "employe@gmail.com"
      }))
      const routes = document.createElement("div")
      routes.setAttribute("route")
      document.body.append(routes)
      Router()
      window.onNavigate(ROUTES_PATH.NewBill)
    })
  })
  describe("When I add a new bill", () => {
    test("Then it creates a new bill", () => {
      jest.spyOn(mockStore, "bills")
        Object.defineProperty(window, 'localStorage', {
              value: {
                getItem: jest.fn(() =>
                    JSON.stringify({
                      email: 'email@test.com',
                    })
                ),
              },
              writable: true,
            })
            const onNavigate = (pathname) => {
              document.body.innerHTML = ROUTES({ pathname })
            }
            const newBill = new NewBill({
              document,
              onNavigate,
              localStorage: window.localStorage,
            })      
      document.body.innerHTML = NewBillUI()
      // initialisation champs bills
      const inputData = {
        type: 'Transports',
        name: 'Test',
        datepicker: '2021-05-26',
        amount: '100',
        vat: '10',
        pct: '19',
        commentary: 'Test',
        file: new File(['test'], 'test.png', { type: 'image/png' }),
      }
      // récupération éléments de la page
      const inputExpenseName = screen.getByTestId('expense-name')
      const inputExpenseType = screen.getByTestId('expense-type')
      const inputDatepicker = screen.getByTestId('datepicker')
      const inputAmount = screen.getByTestId('amount')
      const inputVAT = screen.getByTestId('vat')
      const inputPCT = screen.getByTestId('pct')
      const inputCommentary = screen.getByTestId('commentary')
      const inputFile = document.querySelector(`input[data-testid="file"]`)

      fireEvent.change(inputExpenseType, {
        target: { value: inputData.type },
      })
      expect(inputExpenseType.value).toBe(inputData.type)

      fireEvent.change(inputExpenseName, {
        target: { value: inputData.name },
      })
      expect(inputExpenseName.value).toBe(inputData.name)

      fireEvent.change(inputDatepicker, {
        target: { value: inputData.datepicker },
      })
      expect(inputDatepicker.value).toBe(inputData.datepicker)

      fireEvent.change(inputAmount, {
        target: { value: inputData.amount },
      })
      expect(inputAmount.value).toBe(inputData.amount)

      fireEvent.change(inputVAT, {
        target: { value: inputData.vat },
      })
      expect(inputVAT.value).toBe(inputData.vat)

      fireEvent.change(inputPCT, {
        target: { value: inputData.pct },
      })
      expect(inputPCT.value).toBe(inputData.pct)

      fireEvent.change(inputCommentary, {
        target: { value: inputData.commentary },
      })
      expect(inputCommentary.value).toBe(inputData.commentary)

      userEvent.upload(inputFile, inputData.file)
      expect(inputFile.files[0]).toStrictEqual(inputData.file)
      expect(inputFile.files).toHaveLength(1)

      const handleSubmit = jest.fn(newBill.handleSubmit)
      const formNewBills = document.querySelector(`form[data-testid="form-new-bill"]`)
      formNewBills.addEventListener("submit", handleSubmit)      
      fireEvent.submit(formNewBills)
      expect(handleSubmit).toHaveBeenCalled()
    })
    test("Then it fails with a 404 message error", async() => {
      const html = BillsUI({ error: 'Erreur 404' })
      document.body.innerHTML = html;
      const message = await screen.getByText(/Erreur 404/);
      expect(message).toBeTruthy();
    })
    test("Then it fails with a 500 message error", async() => {
      const html = BillsUI({ error: 'Erreur 500' })
      document.body.innerHTML = html;
      const message = await screen.getByText(/Erreur 500/);
      expect(message).toBeTruthy();
    })
    /*test("png", () => {
      const onNavigate = pathname =>{
        document.body.innerHTML = ROUTES({pathname})
      }
      const fakeNewBill = new NewBill({
        onNavigate, 
        document,
        store: mockStore,
        localStorage: window.localStorage
      })
      const input = screen.getElementById("chemin")
      const test = jest.fn(fakeNewBill.handleChangeFile(e))
      const fakeImg = new File(["img"], "test.png", {type: "image/png"});
      input.addEventListener("change", test)
      userEvent.upload(input, fakeImg)

      expect(test).toBeCalledTimes(1)
      expect(input.files[0]).toStrictEqual(fakeImg)
    })*/
    test("post envoye du formulaire", () => {
      const onNavigate = pathname =>{
        document.body.innerHTML = ROUTES({pathname})
      }
      const fakeNewBill = new NewBill({
        onNavigate, 
        document,
        store: mockStore,
        localStorage: window.localStorage
      })
      const formulaire = screen.getByTestId("form-new-bill")
      const callFunction = jest.fn(fakeNewBill.handleSubmitsubmit(e))
      formulaire.addEventListener("submit", callFunction)
      fireEvent.submit(formulaire)

      expect(callFunction).toBeCalledTimes(1)
    })
  })
})