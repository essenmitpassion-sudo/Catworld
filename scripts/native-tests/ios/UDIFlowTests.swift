import XCTest

final class UDIFlowTests: XCTestCase {
    func testUnconnectedSearchAndPersistenceInBothLanguages() throws {
        continueAfterFailure = false
        let app = XCUIApplication(bundleIdentifier: "stream.soundweave.udi")
        addTeardownBlock {
            let attachment = XCTAttachment(screenshot: app.screenshot())
            attachment.name = "UDI-final-native-screen"
            attachment.lifetime = .keepAlways
            self.add(attachment)
            if self.testRun?.hasSucceeded == false { print(app.debugDescription) }
        }
        app.launch()
        let web = app.webViews.firstMatch
        XCTAssertTrue(web.waitForExistence(timeout: 15))
        print("iOS initial WebView accessibility: \(web.debugDescription.prefix(8000))")
        let introduction = NSPredicate(format: "label CONTAINS %@ OR label CONTAINS %@", "Describe what you need", "Beschreibe deinen Wunsch")
        XCTAssertTrue(web.staticTexts.matching(introduction).firstMatch.waitForExistence(timeout: 15), "Native UI must finish rendering without promising unavailable voice input")
        let wishes = ["Samsung 990 PRO 2 TB", "Samsung 990 PRO 2 TB bis CHF 500"]
        for (index, language) in ["English", "Deutsch"].enumerated() {
            let search = web.links.matching(NSPredicate(format: "label == %@ OR label == %@", "Search", "Suche")).firstMatch
            XCTAssertTrue(search.waitForExistence(timeout: 15)); search.tap()
            let settings = web.buttons.matching(NSPredicate(format: "label BEGINSWITH %@ OR label BEGINSWITH %@", "Language and market:", "Sprache und Markt:")).firstMatch
            XCTAssertTrue(settings.waitForExistence(timeout: 5)); settings.tap()
            // WebKit exposes aria-pressed buttons as native accessibility switches.
            let selector = web.switches[language].firstMatch
            XCTAssertTrue(selector.waitForExistence(timeout: 5))
            XCTAssertTrue(selector.isHittable, "Language action must be reachable in the opened settings")
            if app.statusBars.firstMatch.exists { XCTAssertGreaterThanOrEqual(selector.frame.minY, app.statusBars.firstMatch.frame.maxY, "Language control must clear the status bar") }
            selector.tap()
            settings.tap() // Reopen to inspect the actual selected state, then close.
            let selected = XCTNSPredicateExpectation(predicate: NSPredicate(format: "value == %@", "1"), object: selector)
            XCTAssertEqual(XCTWaiter.wait(for: [selected], timeout: 5), .completed, "The chosen UI language must remain selected")
            settings.tap()
            let field = web.textViews.firstMatch
            XCTAssertTrue(field.waitForExistence(timeout: 5)); field.tap(); field.typeText(wishes[index])
            XCTAssertEqual(field.value as? String, wishes[index], "Native text must match the intended wish")
            let submit = web.buttons[index == 0 ? "Find offers" : "Angebote suchen"].firstMatch
            XCTAssertTrue(submit.waitForExistence(timeout: 5))
            if !submit.isHittable { web.swipeUp() }
            submit.tap()
            let save = web.buttons[index == 0 ? "Save search" : "Suche speichern"].firstMatch
            XCTAssertTrue(save.waitForExistence(timeout: 10))
            let initialStatus = index == 0
                ? "This app cannot show current offers yet. You can save your searches."
                : "Diese App zeigt noch keine aktuellen Angebote. Deine Suchwünsche kannst du speichern."
            XCTAssertTrue(web.staticTexts[initialStatus].firstMatch.waitForExistence(timeout: 5), "The entry status must describe the actual service limitation")
            let unavailable = NSPredicate(format: "label CONTAINS %@", index == 0 ? "not connected" : "noch nicht verbunden")
            XCTAssertTrue(web.staticTexts.matching(unavailable).firstMatch.waitForExistence(timeout: 5), "The submitted search must show its own missing-service error")
            // WebKit can report a clipped offscreen element as hittable.
            // Bound the actual frame to the scrollable content, not the nav.
            let content = web.otherElements["main"].firstMatch
            XCTAssertTrue(content.exists)
            for _ in 0..<3 {
                if save.isHittable && content.frame.insetBy(dx: 0, dy: 6).contains(save.frame) { break }
                web.swipeUp()
            }
            XCTAssertTrue(save.isHittable && content.frame.insetBy(dx: 0, dy: 6).contains(save.frame), "Save action must be fully visible above navigation before tapping")
            save.tap()
            XCTAssertTrue(web.buttons[index == 0 ? "Search saved" : "Suche gespeichert"].waitForExistence(timeout: 5))
            web.links.matching(NSPredicate(format: "label == %@ OR label == %@", "Saved", "Gespeichert")).firstMatch.tap()
            XCTAssertTrue(web.staticTexts[wishes[index]].firstMatch.waitForExistence(timeout: 5))
            print("iOS \(language): text search, real missing-service error and saved search passed")
            // Replace the textarea contents before the next language case.
            if index == 0 {
                web.links["Search"].firstMatch.tap(); field.tap()
                // Put the caret after the known single-line CI wish before
                // deleting; a centre tap alone does not guarantee caret position.
                field.coordinate(withNormalizedOffset: CGVector(dx: 0.95, dy: 0.5)).tap()
                field.typeText(String(repeating: XCUIKeyboardKey.delete.rawValue, count: wishes[index].count))
                let cleared = XCTNSPredicateExpectation(predicate: NSPredicate { _, _ in
                    guard field.exists else { return false }
                    let value = field.value as? String
                    return value == nil || value == "" || value == field.placeholderValue
                }, object: nil)
                XCTAssertEqual(XCTWaiter.wait(for: [cleared], timeout: 5), .completed, "Replacing the wish must clear the previous text")
            }
        }
        app.terminate(); app.launch()
        XCTAssertTrue(web.links["Suche"].firstMatch.waitForExistence(timeout: 10), "German selection survives relaunch")
        web.links.matching(NSPredicate(format: "label == %@ OR label == %@", "Saved", "Gespeichert")).firstMatch.tap()
        for wish in wishes { XCTAssertTrue(web.staticTexts[wish].firstMatch.waitForExistence(timeout: 5)) }
        print("iOS: saved wishes and German UI survived terminate/relaunch; no live service or voice claim")
    }
}
