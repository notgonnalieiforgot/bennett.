import SwiftUI

@main
struct BennettApp: App {
    #if os(iOS)
    @UIApplicationDelegateAdaptor(AppDelegate.self) private var appDelegate
    #elseif os(macOS)
    @NSApplicationDelegateAdaptor(MacAppDelegate.self) private var appDelegate
    #endif

    @StateObject private var theme = ThemeEngine()
    @StateObject private var session = SessionStore()

    var body: some Scene {
        WindowGroup {
            AuthGate { RootView() }
                .environmentObject(theme)
                .environmentObject(session)
                .tint(theme.palette.accent)
                .preferredColorScheme(theme.preferredColorScheme)
                #if os(macOS)
                .frame(minWidth: 980, minHeight: 720)
                #endif
        }
        #if os(macOS)
        .windowStyle(.titleBar)
        .windowToolbarStyle(.unified(showsTitle: false))
        .commands { BennettCommands() }
        #endif
    }
}
