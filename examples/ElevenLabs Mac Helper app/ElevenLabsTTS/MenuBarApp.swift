import SwiftUI
import AppKit
import QuartzCore

@main
struct MenuBarApp: App {
    @NSApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
    
    var body: some Scene {
        Settings {
            EmptyView()
        }
    }
}

class AppDelegate: NSObject, NSApplicationDelegate, ObservableObject {
    var statusItem: NSStatusItem?
    var popover: NSPopover?
    @Published var isMenuOpen = false
    private var eventMonitor: Any?
    
    func applicationDidFinishLaunching(_ notification: Notification) {
        statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.squareLength)
        
        if let button = statusItem?.button {
            button.image = NSImage(named: "elevenlogo")?
                .resized(to: CGSize(width: 18, height: 18))
                .withSymbolConfiguration(.init(pointSize: 18, weight: .regular))
            button.image?.isTemplate = true
            button.action = #selector(togglePopover)
        }
        
        let contentView = ContentView()
            .environmentObject(self)
        let popover = NSPopover()
        popover.contentSize = NSSize(width: 360, height: 300) // Initial size
        popover.behavior = .transient
        popover.animates = true
        popover.contentViewController = NSHostingController(rootView: contentView)
        popover.appearance = NSAppearance(named: .aqua)
        self.popover = popover
        
        setupEventMonitor()
    }
    
    private func setupEventMonitor() {
        eventMonitor = NSEvent.addGlobalMonitorForEvents(matching: [.leftMouseDown, .rightMouseDown]) { [weak self] event in
            guard let self = self, let popover = self.popover else { return }
            
            if popover.isShown && !self.isMenuOpen {
                let mouseLocation = NSEvent.mouseLocation
                let popoverRect = popover.contentViewController?.view.window?.convertToScreen(popover.contentViewController?.view.frame ?? .zero)
                
                if let popoverRect = popoverRect, !popoverRect.contains(mouseLocation) {
                    self.closePopover()
                }
            }
        }
    }
    
    deinit {
        if let eventMonitor = eventMonitor {
            NSEvent.removeMonitor(eventMonitor)
        }
    }
    
    @objc func togglePopover() {
        if let button = statusItem?.button {
            if popover?.isShown == true {
                closePopover()
            } else {
                popover?.show(relativeTo: button.bounds, of: button, preferredEdge: NSRectEdge.minY)
            }
        }
    }
    
    func closePopover() {
        popover?.performClose(nil)
    }
    
    func updatePopoverHeight(height: CGFloat) {
        DispatchQueue.main.async {
            NSAnimationContext.runAnimationGroup { context in
                context.duration = 0.3
                context.timingFunction = CAMediaTimingFunction(name: .easeInEaseOut)
                self.popover?.contentViewController?.view.animator().frame.size.height = height
                self.popover?.contentSize = NSSize(width: 360, height: height)
            } completionHandler: {
                self.popover?.contentViewController?.view.needsDisplay = true
            }
        }
    }
}

extension NSImage {
    func resized(to newSize: CGSize) -> NSImage {
        let newImage = NSImage(size: newSize)
        newImage.lockFocus()
        self.draw(in: NSRect(origin: .zero, size: newSize),
                  from: NSRect(origin: .zero, size: size),
                  operation: .copy,
                  fraction: 1.0)
        newImage.unlockFocus()
        return newImage
    }
}
