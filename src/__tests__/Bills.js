/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import { getAllByTestId } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import router from "../app/Router.js";
import Bills from "../containers/Bills.js";

// je suis connecter en tant qu'employee
describe("Given I am connected as an employee", () => {
  // quand je suis sur la page des facture
  describe("When I am on Bills Page", () => {
    // Alors l'icône de facture dans le layout vertical devrait être mise en évidence
    test("Then bill icon in vertical layout should be highlighted", async () => {
      // crée un faux objet 'localStorage' sur l'objet window de JavaScript
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      // simule un utilisateur connecté en tant qu'employé
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      // initialise le routeur
      // c'est une partie du code qui détermine quelle interface utilisateur doit être affichée en fonction de l'URL actuelle
      router()
      // simule la navigation de l'utilisateur vers la page des factures
      window.onNavigate(ROUTES_PATH.Bills)
      // attend que "data-testid" 'icon-window' soit présent dans le document C'est censé être l'icône de facture
      await waitFor(() => screen.getByTestId('icon-window'))
      // Cette ligne obtient l'icône de la facture.
      const windowIcon = screen.getByTestId('icon-window')
      // vérifie que l'icône de la facture est bien présente dans le document
      expect(windowIcon.classList.contains('active-icon')).toBeTruthy()

    })
    
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    test("quand je clique sur le bouton de creation nouvelle facture, la page nouvelle facture doit s'ouvrir", () => {
      // crée un faux objet 'localStorage' sur l'objet window de JavaScript
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      // simule un utilisateur connecté en tant qu'employé
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      // Mock de la fonction onNavigate
      const onNavigate = jest.fn()

      // crée une instance de la classe Bills avec onNavigate mocké
      const bill = new Bills({
        document,
        onNavigate,
        firestore: null,
        localStorage: localStorageMock,
      })
      // initialise le routeur
      // c'est une partie du code qui détermine quelle interface utilisateur doit être affichée en fonction de l'URL actuelle
      router()
      // simule la navigation de l'utilisateur vers la page des factures
      window.onNavigate(ROUTES_PATH.Bills)
      // attend que "data-testid" 'icon-window' soit présent dans le document C'est censé être l'icône de facture
       waitFor(() => screen.getByTestId('icon-window'))
    
      const btnNewBill = document.querySelector('button[data-testid="btn-new-bill"]')
      btnNewBill.click()
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['NewBill'])
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
