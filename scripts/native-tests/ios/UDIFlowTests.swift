import XCTest

final class UDIFlowTests: XCTestCase {
    func testUnconnectedSearchAndPersistenceInBothLanguages() throws {
        continueAfterFailure = false
        let app = XCUIApplication(bundleIdentifier: "stream.soundweave.udi")
        addTeardownBlock { if self.testRun?.hasSucceeded == false { print(app.debugDescription) } }
        app.launch()
        XCTAssertTrue(app.webViews.firstMatch.waitForExistence(timeout: 15))
        let wishes = ["Samsung 990 PRO 2 TB", "Samsung 990 PRO 2 TB bis CHF 500"]
        for (index, language) in ["English", "Deutsch"].enumerated() {
            let search = app.links.matching(NSPredicate(format: "label == %@ OR label == %@", "Search", "Suche")).firstMatch
            XCTAssertTrue(search.waitForExistence(timeout: 15)); search.tap()
            let selectors = app.webViews.otherElements.matching(NSPredicate(format: "label == %@ OR label == %@", "Interface language", "Oberflächensprache"))
            XCTAssertTrue(selectors.firstMatch.waitForExistence(timeout: 5))
            let selector = try XCTUnwrap(selectors.allElementsBoundByIndex.first(where: { $0.isHittable }))
            if app.statusBars.firstMatch.exists { XCTAssertGreaterThanOrEqual(selector.frame.minY, app.statusBars.firstMatch.frame.maxY, "Language control must clear the status bar") }
            selector.tap()
            if app.buttons[language].firstMatch.waitForExistence(timeout: 2) { app.buttons[language].firstMatch.tap() }
            else if app.pickerWheels.firstMatch.exists {
                app.pickerWheels.firstMatch.adjust(toPickerWheelValue: language)
                if app.toolbars.buttons["Done"].exists { app.toolbars.buttons["Done"].tap() }
                else if app.toolbars.buttons["Fertig"].exists { app.toolbars.buttons["Fertig"].tap() }
            } else { app.staticTexts[language].firstMatch.tap() }
            let field = app.webViews.textViews.firstMatch
            XCTAssertTrue(field.waitForExistence(timeout: 5)); field.tap(); field.typeText(wishes[index])
            XCTAssertEqual(field.value as? String, wishes[index], "Native text must match the intended wish")
            let submit = app.buttons[index == 0 ? "Find offers" : "Angebote suchen"].firstMatch
            XCTAssertTrue(submit.waitForExistence(timeout: 5))
            if !submit.isHittable { app.webViews.firstMatch.swipeUp() }
            submit.tap()
            let save = app.buttons[index == 0 ? "Save search" : "Suche speichern"].firstMatch
            XCTAssertTrue(save.waitForExistence(timeout: 10))
            let initialStatus = index == 0
                ? "This app cannot show current offers yet. You can save your searches."
                : "Diese App zeigt noch keine aktuellen Angebote. Deine Suchwünsche kannst du speichern."
            XCTAssertTrue(app.staticTexts[initialStatus].firstMatch.waitForExistence(timeout: 5), "The entry status must describe the actual service limitation")
            let unavailable = NSPredicate(format: "label CONTAINS %@", index == 0 ? "not connected" : "noch nicht verbunden")
            XCTAssertTrue(app.staticTexts.matching(unavailable).firstMatch.waitForExistence(timeout: 5), "The submitted search must show its own missing-service error")
            if !save.isHittable { app.webViews.firstMatch.swipeUp() }
            save.tap()
            XCTAssertTrue(app.buttons[index == 0 ? "Search saved" : "Suche gespeichert"].waitForExistence(timeout: 5))
            app.links.matching(NSPredicate(format: "label == %@ OR label == %@", "Saved", "Gespeichert")).firstMatch.tap()
            XCTAssertTrue(app.staticTexts[wishes[index]].firstMatch.waitForExistence(timeout: 5))
            print("iOS \(language): text search, real missing-service error and saved search passed")
            // Replace the textarea contents before the next language case.
            if index == 0 {
                app.links["Search"].firstMatch.tap(); field.tap()
                field.typeText(String(repeating: XCUIKeyboardKey.delete.rawValue, count: wishes[index].count))
            }
        }
        app.terminate(); app.launch()
        XCTAssertTrue(app.links["Suche"].firstMatch.waitForExistence(timeout: 10), "German selection survives relaunch")
        app.links.matching(NSPredicate(format: "label == %@ OR label == %@", "Saved", "Gespeichert")).firstMatch.tap()
        for wish in wishes { XCTAssertTrue(app.staticTexts[wish].firstMatch.waitForExistence(timeout: 5)) }
        print("iOS: saved wishes and German UI survived terminate/relaunch; no live service or voice claim")
    }
}
