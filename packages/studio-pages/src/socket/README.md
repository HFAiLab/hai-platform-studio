# socket 维护指南

> 这块内容比较复杂，坑也比较多，故整理出一个维护指南

# 状态机流转

io-frontier 内部状态机：

```
waitConnection → connected  ↖
                    ↑↓        ↖
                 disconnect -> stopped
```

我们是直接需要这个状态机的，原因：

- bff 升级的时候可能造成短暂的断开和重连，这个 io-frontier 内部维护并恢复状态，实际上不会影响到外部。
