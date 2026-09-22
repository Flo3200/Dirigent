import Foundation

func nowMs() -> Double { Date().timeIntervalSince1970 * 1000 }

func makeId(_ prefix: String, _ len: Int = 8) -> String {
    let chars = Array("abcdefghijkmnpqrstuvwxyz23456789")
    return prefix + "_" + String((0..<len).map { _ in chars.randomElement()! })
}

struct Agent: Codable {
    var id: String
    var name: String
    var role: String            // "worker" | "manager"
    var tags: [String]
    var description: String
    var cwd: String
    var model: String
    var color: String
    var registeredAt: Double
    var lastSeen: Double
    var completed: Int
    var failed: Int
}

struct ProgressEntry: Codable {
    var time: Double
    var text: String
}

struct TaskItem: Codable {
    var id: String
    var title: String
    var prompt: String
    /// Ziel-Syntax: any | manager | all | agent:<id|name> | tag:<tag>
    var target: String
    var status: String          // queued | running | done | failed | cancelled
    var assignedAgentId: String?
    var result: String?
    var error: String?
    var progress: [ProgressEntry]
    var createdAt: Double
    var startedAt: Double?
    var finishedAt: Double?
    var createdBy: String
    var parentId: String?
    /// Agent, der bei Abschluss benachrichtigt wird (z. B. der Manager, der delegiert hat).
    var notifyAgentId: String?
    var templateId: String?
    var runId: String?
    var stepIndex: Int?
    var priority: Int
    var kind: String            // task | notification
}

struct Template: Codable {
    var id: String
    var name: String
    var description: String
    var prompt: String
    var target: String
    var icon: String
    var scheduleMinutes: Int
    var lastRunAt: Double?
    var createdAt: Double
}

struct WorkflowStep: Codable {
    var name: String
    var templateId: String?
    var prompt: String
    var target: String
}

struct Workflow: Codable {
    var id: String
    var name: String
    var description: String
    var steps: [WorkflowStep]
    var createdAt: Double
}

struct WorkflowRun: Codable {
    var id: String
    var workflowId: String
    var workflowName: String
    var input: String
    var status: String          // running | done | failed | cancelled
    var currentStep: Int
    var stepCount: Int
    var taskIds: [String]
    var results: [String]
    var createdAt: Double
    var finishedAt: Double?
}

struct Webhook: Codable {
    var id: String
    var url: String
    var events: [String]        // ["*"] oder z. B. ["task.completed"]
    var active: Bool
    var lastStatus: String?
    var createdAt: Double
}

struct Settings: Codable {
    var port: Int
    var lanAccess: Bool
    var apiKey: String
    var notifications: Bool

    static let `default` = Settings(port: 7777, lanAccess: false, apiKey: "", notifications: true)
}

struct EventEntry: Codable {
    var id: String
    var time: Double
    var type: String
    var message: String
    var ref: String?
}

struct Database: Codable {
    var agents: [Agent] = []
    var tasks: [TaskItem] = []
    var templates: [Template] = []
    var workflows: [Workflow] = []
    var runs: [WorkflowRun] = []
    var webhooks: [Webhook] = []
    var settings: Settings = .default
    var events: [EventEntry] = []

    init() {}

    // Tolerant laden: ein defekter Bereich verwirft nicht die ganze Datenbank.
    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        agents = (try? c.decode([Agent].self, forKey: .agents)) ?? []
        tasks = (try? c.decode([TaskItem].self, forKey: .tasks)) ?? []
        templates = (try? c.decode([Template].self, forKey: .templates)) ?? []
        workflows = (try? c.decode([Workflow].self, forKey: .workflows)) ?? []
        runs = (try? c.decode([WorkflowRun].self, forKey: .runs)) ?? []
        webhooks = (try? c.decode([Webhook].self, forKey: .webhooks)) ?? []
        settings = (try? c.decode(Settings.self, forKey: .settings)) ?? .default
        events = (try? c.decode([EventEntry].self, forKey: .events)) ?? []
    }
}

/// In JSON-kompatibles Dictionary umwandeln.
func toJSONObject<T: Encodable>(_ v: T) -> Any {
    guard let data = try? JSONEncoder().encode(v),
          let obj = try? JSONSerialization.jsonObject(with: data, options: [.fragmentsAllowed]) else { return NSNull() }
    return obj
}

extension Dictionary where Key == String, Value == Any {
    func str(_ k: String) -> String? {
        if let s = self[k] as? String { return s }
        if let n = self[k] as? NSNumber { return n.stringValue }
        return nil
    }
    func int(_ k: String) -> Int? {
        if let n = self[k] as? NSNumber { return n.intValue }
        if let s = self[k] as? String { return Int(s) }
        return nil
    }
    func bool(_ k: String) -> Bool? {
        if let b = self[k] as? Bool { return b }
        if let s = self[k] as? String { return ["1", "true", "yes", "ja", "on"].contains(s.lowercased()) }
        if let n = self[k] as? NSNumber { return n.boolValue }
        return nil
    }
    func strings(_ k: String) -> [String]? {
        if let a = self[k] as? [String] { return a }
        if let s = self[k] as? String {
            return s.split(whereSeparator: { $0 == "," || $0 == " " }).map { String($0) }.filter { !$0.isEmpty }
        }
        return nil
    }
}
