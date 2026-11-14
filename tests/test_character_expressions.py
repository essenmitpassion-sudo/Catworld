from neonpaw.district import characters
from tests.test_district_ui import app


def test_expressions_are_individual_and_brief():
    assert characters.expression_index('lumi',.4,True)==1
    assert characters.expression_index('lumi',2,True)==0
    assert characters.expression_index('pixel',.4,True)==0
    assert characters.expression_index('lumi',.4,False)==0


def test_expression_art_preserves_original_portraits(app):
    art=characters.load_characters()
    assert set(art['expressions'])=={'lumi','pixel'}
    for name in ('lumi','pixel'):
        assert len(art['expressions'][name])==2
        assert name in art['portraits'] and name in art['closeups']
        assert art['expressions'][name][1].get_height()<=84
