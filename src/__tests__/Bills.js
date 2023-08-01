import {getAllByTestId, screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import {ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";

import router from "../app/Router.js";
import Bills from "../containers/Bills.js";
import mockedBills from "../__mocks__/store.js";
import userEvent from '@testing-library/user-event'

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      expect(screen.getByTestId('icon-window').classList.contains('active-icon')).toBe(true) // ajout pour vérifier le test de surbrillance
    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
    test('Function handleClickNewBill should be called', () => { // ajout test pour vérifier l'appel de la fonction handleClickNewBill
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
      }))
      const store = mockedBills
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const billsCompo = new Bills({
        document, onNavigate, store, localStorage: window.localStorage
      })
      const billsList = billsCompo.getBills()    
      billsList.then((snapshot) => {
        document.body.innerHTML = BillsUI({ data: snapshot })
        const handleClickNewBill = jest.fn(billsCompo.handleClickNewBill)
        const button = screen.getByTestId('btn-new-bill')
        if (!!button) {
          button.addEventListener('click', handleClickNewBill)
          userEvent.click(button)
          expect(handleClickNewBill).toHaveBeenCalled()
        } else {
          expect(handleClickNewBill).not.toHaveBeenCalled()
        }
      })
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
  })
  describe("Quand je clique sur l'icone œil pour voir une facture", () => {
    test("Alors la modale devrait s'ouvrir avec la facture affichée", () => {
      // crée un faux objet 'localStorage' sur l'objet window de JavaScript
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      // simule un utilisateur connecté en tant qu'employé
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const bill = new Bills({
        document,
        onNavigate: () => {},
        firestore: null,
        localStorage: localStorageMock,
      })
      document.body.innerHTML = BillsUI({data: {bills}})
      $.fn.modal = jest.fn()
      const icon = getAllByTestId(document.body, "btn-new-bill")[0]
      const test = jest.fn(bill.handleClickIconEye(icon))
      icon.addEventListener("click", test)
      userEvent.click(icon)
      expect(test).toHaveBeenCalled()
      expect(screen.getByText("Justificatif")).toBeTruthy()
    })
  })
})
 