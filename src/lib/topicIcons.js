/** Topic → icon key for journey path */
export const TOPIC_ICON_KEYS = {
  "cil-dbms": "database",
  "cil-os": "cpu",
  "cil-cn": "network",
  "cil-dsa-mcq": "algo",
  "cil-c": "code",
  "cil-quant-pct": "percent",
  "cil-quant-tsd": "clock",
  "cil-reason-syl": "logic",
  "cil-reason-puzzle": "puzzle",
  "cil-eng-rc": "book",
  "cil-gk": "globe",
  "corp-arr-2p": "array",
  "corp-arr-hash": "hash",
  "corp-tree": "tree",
  "corp-graph": "graph",
  "corp-java-oop": "java",
  "corp-java-init": "layers",
  "corp-spring": "spring",
  "corp-triage-1": "ticket",
  "corp-triage-2": "docker",
  "corp-amdocs": "briefcase",
};

export function getTopicIconKey(topicId, track = "cil") {
  return TOPIC_ICON_KEYS[topicId] || (track === "corporate" ? "code" : "book");
}
