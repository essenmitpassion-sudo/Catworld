# VEIL rules / version 1

7×7; two fixed blocks at D3/D5; relays at B4/D4/F4. Each side deploys six agents: two Spark/Funke, two Ward/Schild, two Shade/Schatten. Roles are randomly arranged by a deterministic seed. Only your own and publicly revealed roles are visible. Human deployment can be rearranged by swapping own initial cells before Start. The seed alternates initiative; the second side receives two starting signal.

One action per turn:

- Move one agent one orthogonal cell onto an empty square or attack an adjacent enemy. Own pieces and blocks cannot be entered.
- Echo a hidden enemy on the same row/column within three squares. The first piece or block stops the ray. This reveals both the sender and target; it does not move them.
- Pass only if neither of the above is legal.

Direct combat reveals both roles. Spark beats Ward, Ward beats Shade, Shade beats Spark. Equal roles remove both agents. The winner occupies/keeps the defender's square. An attack with friendly support on the clear line beyond the defender is a guaranteed pincer win.

Closing a line pincer during a move immediately captures an enclosed enemy: a ray from the moved agent meets one enemy and then a friendly support, with only empty cells between. Other pieces/blocks interrupt the ray. Several directions can capture simultaneously. A quiet move closing a pincer does not expose the mover's role; captured roles become public. Resolve direct combat first, then closures from the surviving moved agent.

After an action, check elimination first: a sole surviving side wins; mutual final elimination draws. Otherwise begin the opponent's turn and add one signal per relay it holds. This gives the other side a full action to contest occupation before it scores. Reaching eight signal wins. Three identical states (positions, public reveals, scores, side to move) draw. At 80 actions higher signal wins, tied signal draws.

All movement, public reveals and capture effects are deterministic. No midgame dice. Unknown roles create uncertainty, not a hidden random roll. The computer receives `observe(game, side)` only. It cannot read the opponent's hidden roles or setup seed. Replays reconstruct legal actions and the information known at each action; viewing one never rewinds a live match.
