const router = require('express').Router();
const {
  getCommittee,
  createCommitteeMember,
  deleteCommitteeMember,
  getGeneralMembers,
  createGeneralMember,
  deleteGeneralMember,
  getBusinessMembers,
} = require('../controllers/members.controller');

router.get('/committee', getCommittee);
router.post('/committee', createCommitteeMember);
router.delete('/committee/:id', deleteCommitteeMember);

router.get('/general', getGeneralMembers);
router.post('/general', createGeneralMember);
router.delete('/general/:membershipNo', deleteGeneralMember);

router.get('/business', getBusinessMembers);

module.exports = router;
