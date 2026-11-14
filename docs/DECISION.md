# First playable decision

Human feedback: the prior solo game became boring after two or three plays. The owner chose hidden roles/bluff and authorized replacing the Catworld learning game completely. Original history remains at 7175190; verified complete Git bundle exists outside the checkout.

Compared four cores: hidden-rank capture is easy but too close to Stratego; programmable energy combat adds too many rules; simultaneous secret orders add resolution complexity; relay control plus hidden cyclic roles and guaranteed positional pincers is compact and testable. Choose the last as VEIL. This is a design hypothesis, not a proven fun result.

Six agents per side (two Spark, two Ward, two Shade) on 7×7. Each turn move one orthogonal step/capture OR Echo one visible-in-line masked enemy within three cells. Cyclic combat: Spark beats Ward, Ward beats Shade, Shade beats Spark; equal removes both. A friendly agent directly beyond the defender gives a pincer: attacker wins regardless of role. Combat reveals both participants; Echo reveals source and target. Roles stay revealed. Opponent roles otherwise hidden; pieces have no role-dependent move patterns.

Three relays score at the beginning of their owner's next turn, giving an opponent a full reply to contest. The second player starts with 2 signal as initiative compensation. First to 8 signal or eliminate the opposition wins. Threefold repetition draws; after 80 actions higher signal wins, tied signal draws. Empty-action pass only when no move or Echo exists. Seeded setup may be rearranged by swapping the human's own pieces before starting. Both first-player orders are exercised. AI receives only the observation projection, not the authoritative state.

Implementation: pure JS rule/observation engine, observation-only AI, dependency-light browser UI, Node rule tests, seeded simulations, actual Chromium full-match checks, standalone offline bundle. Checkpoint the first tested complete match before adding mechanics. Defer more roles, equipment, online multiplayer and decorative assets.

Paired 24-seed balanced-policy experiment: starter wins 36/48 with no compensation, 34/48 with 1, 31/48 with 2. Select 2 for the first prototype, while explicitly retaining initiative bias as an open issue rather than claiming balanced play. This controlled comparison is bot evidence only.
