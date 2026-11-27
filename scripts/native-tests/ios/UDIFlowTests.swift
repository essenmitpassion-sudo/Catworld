import XCTest

final class UDIFlowTests: XCTestCase {
    func testProtectedFixtureSearchAndRestoration() {
        continueAfterFailure = false
        let app = XCUIApplication(bundleIdentifier: "stream.soundweave.udi")
        app.launch()
        let web = app.webViews.firstMatch
        XCTAssertTrue(web.waitForExistence(timeout: 15), "Installed app must launch its WebView")
        let settings = web.buttons.matching(NSPredicate(format: "label BEGINSWITH %@ OR label BEGINSWITH %@", "Language and market:", "Sprache und Markt:")).firstMatch
        XCTAssertTrue(settings.waitForExistence(timeout: 15))
        settings.tap()
        let english = web.switches["English"].firstMatch
        XCTAssertTrue(english.waitForExistence(timeout: 5))
        english.tap()
        XCTAssertTrue(web.buttons["Language and market: English"].firstMatch.waitForExistence(timeout: 15))
        XCTAssertTrue(web.staticTexts["Test environment · Simulated accounts and prices only"].firstMatch.waitForExistence(timeout: 10))
        print("iOS fixture: launched installed app (EN)")

        let main = web.otherElements["main"].firstMatch
        let field = web.textViews.firstMatch
        let submit = web.buttons["Find offers"].firstMatch
        let wish = "Samsung 990 PRO 2 TB"
        let offerMarker = web.staticTexts.matching(NSPredicate(format: "label BEGINSWITH %@", "TEST DATA")).firstMatch
        let sellerLinkDisabled = web.staticTexts["Test data: seller link disabled."].firstMatch
        let signOut = web.buttons["Sign out"].firstMatch

        func tapVisible(_ control: XCUIElement, in surface: XCUIElement) {
            XCTAssertTrue(control.waitForExistence(timeout: 10))
            for _ in 0..<4 {
                var visible = surface.frame
                let keyboard = app.keyboards.firstMatch
                if keyboard.exists {
                    visible.size.height = max(0, min(visible.maxY, keyboard.frame.minY) - visible.minY)
                }
                if control.isHittable && visible.insetBy(dx: 0, dy: 6).contains(control.frame) {
                    control.tap()
                    return
                }
                if control.frame.minY < visible.minY {
                    surface.swipeDown(velocity: .slow)
                } else {
                    surface.swipeUp(velocity: .slow)
                }
            }
            XCTFail("Control must clear the keyboard and navigation before tapping")
        }

        func search(_ replacement: String, replacing previous: String? = nil) {
            tapVisible(field, in: main)
            if let previous {
                field.coordinate(withNormalizedOffset: CGVector(dx: 0.95, dy: 0.5)).tap()
                field.typeText(String(repeating: XCUIKeyboardKey.delete.rawValue, count: previous.count))
            }
            field.typeText(replacement)
            XCTAssertEqual(field.value as? String, replacement)
            tapVisible(submit, in: main)
        }

        func checkOffer(_ badge: String, amount: String) {
            func resultState() -> String {
                let states = [
                    ("loading", "Searching and checking offers"),
                    ("rejectedResponse", "The response could not be checked safely"),
                    ("unavailable", "Web search is temporarily unavailable"),
                    ("transportFailure", "The connection to the offer service failed"),
                    ("expiredSession", "Your sign-in to the offer service has expired"),
                    ("invalidWish", "Describe what you want to buy as text without a web address")
                ]
                return states.map { flag, phrase in
                    let label = web.staticTexts.matching(NSPredicate(format: "label CONTAINS %@", phrase)).firstMatch
                    return "\(flag)=\(label.exists)"
                }.joined(separator: ", ")
            }
            XCTAssertTrue(offerMarker.waitForExistence(timeout: 15), "Synthetic result must be explicitly labelled. \(resultState())")
            XCTAssertTrue(web.staticTexts[badge].firstMatch.waitForExistence(timeout: 8))
            let price = web.staticTexts.matching(NSPredicate(format: "label CONTAINS %@ AND label CONTAINS %@", "CHF", amount)).firstMatch
            XCTAssertTrue(price.waitForExistence(timeout: 5))
            XCTAssertTrue(sellerLinkDisabled.waitForExistence(timeout: 5))
            XCTAssertFalse(web.links["Open offer page"].exists)
            XCTAssertFalse(web.buttons["Deal Passport"].exists)
        }

        func checkUsage(_ used: Int) {
            let usage = web.staticTexts.matching(NSPredicate(format: "label CONTAINS %@", "Test plan Plus · \(used) of 3 searches")).firstMatch
            XCTAssertTrue(usage.waitForExistence(timeout: 10))
        }

        XCTAssertTrue(web.buttons["Sign in"].firstMatch.waitForExistence(timeout: 10))
        search(wish)
        let email = web.textFields["Email address"].firstMatch
        XCTAssertTrue(email.waitForExistence(timeout: 10), "Protected search must show sign-in")
        email.tap()
        email.typeText("plus@udi.test")
        tapVisible(web.buttons["Request code"].firstMatch, in: web)
        let code = web.textFields["Six-digit code"].firstMatch
        XCTAssertTrue(code.waitForExistence(timeout: 10))
        code.tap()
        code.typeText("999999")
        tapVisible(web.buttons["Confirm code"].firstMatch, in: web)
        let rejected = web.staticTexts.matching(NSPredicate(format: "label CONTAINS %@", "incorrect or has expired")).firstMatch
        XCTAssertTrue(rejected.waitForExistence(timeout: 10), "Incorrect fixture code must be rejected")
        // The provider may invalidate a challenge after a failed verification.
        tapVisible(web.buttons["Request a new code"].firstMatch, in: web)
        let cleared = XCTNSPredicateExpectation(predicate: NSPredicate { _, _ in
            guard code.exists else { return false }
            let value = code.value as? String
            return value == nil || value == "" || value == code.placeholderValue
        }, object: nil)
        XCTAssertEqual(XCTWaiter.wait(for: [cleared], timeout: 10), .completed)
        code.tap()
        code.typeText("123456")
        tapVisible(web.buttons["Confirm code"].firstMatch, in: web)
        XCTAssertTrue(signOut.waitForExistence(timeout: 15))
        checkUsage(0)
        XCTAssertEqual(field.value as? String, wish, "Sign-in must preserve the draft")
        XCTAssertFalse(offerMarker.exists, "Sign-in must not submit the draft")
        print("iOS fixture: protected login, rejected code and explicit search gate passed")

        tapVisible(submit, in: main)
        checkOffer("Incomplete / estimate", amount: "99.00")
        tapVisible(web.buttons["Save search"].firstMatch, in: main)
        XCTAssertTrue(web.buttons["Search saved"].firstMatch.waitForExistence(timeout: 8))
        print("iOS fixture: protected search and incomplete CHF 99.00 price passed; account search saved")

        let confirmed = "\(wish) confirmed"
        search(confirmed, replacing: wish)
        checkOffer("Confirmed total", amount: "104.00")
        print("iOS fixture: confirmed CHF 104.00 total and disabled seller link passed")

        let failing = "UDI fixture unavailable"
        search(failing, replacing: confirmed)
        XCTAssertTrue(web.staticTexts["Web search is temporarily unavailable."].firstMatch.waitForExistence(timeout: 15))
        XCTAssertTrue(web.staticTexts["Not verifiable"].firstMatch.waitForExistence(timeout: 5))
        checkUsage(2)
        XCTAssertFalse(offerMarker.exists, "A failed search must clear the preceding result")
        XCTAssertEqual(field.value as? String, failing)
        print("iOS fixture: service error displayed, old offers cleared, draft retained and Plus usage stayed at 2 of 3")

        app.terminate()
        app.launch()
        XCTAssertTrue(signOut.waitForExistence(timeout: 15), "Fixture session must restore after process termination")
        checkUsage(2)
        let saved = web.links["Saved"].firstMatch
        XCTAssertTrue(saved.waitForExistence(timeout: 10))
        saved.tap()
        XCTAssertTrue(web.staticTexts[wish].firstMatch.waitForExistence(timeout: 10), "Account search must load from the protected service after relaunch")
        print("iOS fixture: sign-in, Plus usage and protected saved search restored after terminate/relaunch")
    }

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
        let microphone = web.descendants(matching: .any).matching(NSPredicate(format: "label == %@ OR label == %@", "Speak", "Einsprechen")).firstMatch
        XCTAssertTrue(microphone.waitForExistence(timeout: 15))
        microphone.tap()
        let startDictation = web.buttons.matching(NSPredicate(format: "label == %@ OR label == %@", "Start dictation", "Diktat starten")).firstMatch
        XCTAssertTrue(startDictation.waitForExistence(timeout: 15), "Explain dictation before requesting permission")
        let closeDictation = web.buttons.matching(NSPredicate(format: "label == %@ OR label == %@", "Cancel", "Abbrechen")).firstMatch
        XCTAssertTrue(closeDictation.isHittable)
        closeDictation.tap()
        print("iOS: microphone explanation opened and closed before requesting permission")
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
            // Wait for the translated accessibility tree before reopening.
            // On a busy simulator the previous label can survive the tap even
            // though WebKit eventually exposes the new language and selection.
            let translatedLabel = index == 0 ? "Language and market: English" : "Sprache und Markt: Deutsch"
            let translatedSettings = web.buttons[translatedLabel].firstMatch
            XCTAssertTrue(translatedSettings.waitForExistence(timeout: 20), "The settings label must reflect the chosen language")
            translatedSettings.tap()
            let selected = web.switches.matching(NSPredicate(format: "label == %@ AND value == %@", language, "1")).firstMatch
            XCTAssertTrue(selected.waitForExistence(timeout: 20), "The chosen UI language must remain selected")
            translatedSettings.tap()
            let field = web.textViews.firstMatch
            XCTAssertTrue(field.waitForExistence(timeout: 5)); field.tap(); field.typeText(wishes[index])
            XCTAssertEqual(field.value as? String, wishes[index], "Native text must match the intended wish")
            let submit = web.buttons[index == 0 ? "Find offers" : "Angebote suchen"].firstMatch
            XCTAssertTrue(submit.waitForExistence(timeout: 5))
            let content = web.otherElements["main"].firstMatch
            XCTAssertTrue(content.exists)
            func submitReachable() -> Bool {
                let keyboard = app.keyboards.firstMatch
                var viewport = content.frame
                if keyboard.exists {
                    viewport.size.height = max(0, min(viewport.maxY, keyboard.frame.minY) - viewport.minY)
                }
                return submit.isHittable && viewport.insetBy(dx: 0, dy: 10).contains(submit.frame)
            }
            for _ in 0..<3 {
                if submitReachable() { break }
                content.swipeUp(velocity: .slow)
            }
            XCTAssertTrue(submitReachable(), "Search action must clear the keyboard and navigation before tapping")
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
